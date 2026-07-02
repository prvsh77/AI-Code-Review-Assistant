import { Router } from "express";
import { db } from "@workspace/db";
import { 
  pullRequestsTable, 
  reviewsTable, 
  reviewFilesTable, 
  reviewCommentsTable, 
  securityIssuesTable, 
  activityItemsTable,
  usersTable
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireGitHubToken, AuthenticatedRequest } from "../middlewares/auth";
import { getRepositoryById, listPullRequests, getPullRequest, getPullRequestFiles, downloadFileContent } from "../lib/github";
import { escapeHtml } from "../lib/sanitizer";

const router = Router();

// In-memory job status map
export const activeJobs = new Map<string, {
  jobId: string;
  pullRequestId: number;
  status: "analyzing" | "completed" | "failed";
  progress: number;
  reviewId?: number;
  error?: string;
  agents: { name: string; status: "waiting" | "running" | "completed" | "failed"; progress: number | null }[];
}>();

router.get("/pull-requests", requireGitHubToken as any, async (req: AuthenticatedRequest, res) => {
  const { status, repositoryId } = req.query as { status?: string; repositoryId?: string };
  const token = req.githubToken!;

  if (!repositoryId) {
    res.status(400).json({ error: "Missing repositoryId parameter" });
    return;
  }

  const repoIdNum = parseInt(repositoryId, 10);
  if (isNaN(repoIdNum)) {
    res.status(400).json({ error: "Invalid repositoryId" });
    return;
  }

  try {
    // 1. Get repository details to resolve owner and name
    const repo = await getRepositoryById(token, repoIdNum);
    const owner = repo.owner.login;
    const repoName = repo.name;

    // 2. Fetch live pull requests from GitHub
    const pulls = await listPullRequests(token, owner, repoName, status);

    // 3. Sync live PRs in our cache table and left-join review status
    const result = await Promise.all(
      pulls.map(async (pr) => {
        // Check if there is an active background job
        const jobKey = `job-${pr.id}`;
        const job = Array.from(activeJobs.values()).find(j => j.pullRequestId === pr.id);
        
        // Check if there is a completed review in database
        const [completedReview] = await db
          .select()
          .from(reviewsTable)
          .where(eq(reviewsTable.pullRequestId, pr.id))
          .orderBy(desc(reviewsTable.reviewedAt))
          .limit(1);

        let reviewStatus: "pending" | "analyzing" | "completed" = "pending";
        if (completedReview) {
          reviewStatus = "completed";
        } else if (job && job.status === "analyzing") {
          reviewStatus = "analyzing";
        }

        const prData = {
          id: pr.id,
          number: pr.number,
          title: pr.title,
          author: pr.user.login,
          authorAvatar: pr.user.avatar_url,
          repositoryId: repoIdNum,
          repositoryName: repoName,
          filesChanged: pr.changed_files || 0,
          commits: pr.commits || 1,
          status: pr.state === "open" ? ("open" as const) : pr.merged_at ? ("merged" as const) : ("closed" as const),
          reviewStatus,
        };

        // Cache the PR details in local DB so we can resolve details in trigger-review
        await db
          .insert(pullRequestsTable)
          .values(prData)
          .onConflictDoUpdate({
            target: pullRequestsTable.id,
            set: {
              title: prData.title,
              status: prData.status,
              filesChanged: prData.filesChanged,
              commits: prData.commits,
              reviewStatus: prData.reviewStatus,
            },
          });

        return {
          ...prData,
          createdAt: new Date(pr.created_at).toISOString(),
        };
      })
    );

    res.json(result);
  } catch (err: any) {
    req.log?.error(err, "Failed to fetch pull requests");
    
    if (err.code === "GITHUB_TOKEN_EXPIRED") {
      res.status(401).json({ error: "github_token_expired", message: err.message });
      return;
    }
    
    res.status(err.status || 500).json({
      error: "Failed to fetch pull requests",
      detail: err.message,
    });
  }
});

router.get("/pull-requests/:id", requireGitHubToken as any, async (req: AuthenticatedRequest, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const [row] = await db.select().from(pullRequestsTable).where(eq(pullRequestsTable.id, id));
    if (!row) {
      res.status(404).json({ error: "Pull request not found in cache" });
      return;
    }

    res.json({
      id: row.id,
      number: row.number,
      title: row.title,
      author: row.author,
      authorAvatar: row.authorAvatar,
      repositoryId: row.repositoryId,
      repositoryName: row.repositoryName,
      filesChanged: row.filesChanged,
      commits: row.commits,
      status: row.status,
      reviewStatus: row.reviewStatus,
      createdAt: row.createdAt.toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: "Database lookup failed", detail: err.message });
  }
});

// GET review job progress
router.get("/pull-requests/jobs/:jobId", async (req, res) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(job);
});

// Trigger review (runs in the background)
router.post("/pull-requests/:id/trigger-review", requireGitHubToken as any, async (req: AuthenticatedRequest, res) => {
  const prId = parseInt(req.params.id as string, 10);
  if (isNaN(prId)) {
    res.status(400).json({ error: "Invalid PR ID" });
    return;
  }

  const token = req.githubToken!;
  const userId = req.user!.userId;

  try {
    // 1. Get cached PR details to resolve repository name & PR number
    const [pr] = await db.select().from(pullRequestsTable).where(eq(pullRequestsTable.id, prId)).limit(1);
    if (!pr) {
      res.status(404).json({ error: "Pull request not found in cache. List repositories and pull requests first." });
      return;
    }

    // 2. Fetch repo details from GitHub
    const repo = await getRepositoryById(token, pr.repositoryId);
    const owner = repo.owner.login;
    const repoName = pr.repositoryName;

    // Create the background job
    const jobId = `job-${prId}-${Date.now()}`;
    const job = {
      jobId,
      pullRequestId: prId,
      status: "analyzing" as const,
      progress: 0,
      agents: [
        { name: "Code Quality Agent", status: "waiting" as const, progress: null },
        { name: "Security Agent", status: "waiting" as const, progress: null },
        { name: "Complexity Agent", status: "waiting" as const, progress: null },
        { name: "Documentation Agent", status: "waiting" as const, progress: null },
      ],
    };
    activeJobs.set(jobId, job);

    // Update PR review status to analyzing
    await db
      .update(pullRequestsTable)
      .set({ reviewStatus: "analyzing" })
      .where(eq(pullRequestsTable.id, prId));

    // Start background analysis
    runBackgroundReview(jobId, token, owner, repoName, pr, userId).catch((err) => {
      console.error(`Background review job ${jobId} failed:`, err);
    });

    res.status(202).json({
      jobId,
      pullRequestId: prId,
      status: "analyzing",
      progress: 0,
      agents: job.agents,
    });
  } catch (err: any) {
    req.log?.error(err, "Failed to trigger review");
    res.status(500).json({ error: "Failed to trigger review", detail: err.message });
  }
});

// Helper to run the review process in the background
async function runBackgroundReview(
  jobId: string,
  token: string,
  owner: string,
  repoName: string,
  pr: any,
  userId: number
): Promise<void> {
  const job = activeJobs.get(jobId)!;

  try {
    // 1. Fetch complete PR details from GitHub to resolve head SHA
    const prDetails = await getPullRequest(token, owner, repoName, pr.number);
    const headSha = prDetails.head.sha;

    // 2. Get changed files
    const changedFiles = await getPullRequestFiles(token, owner, repoName, pr.number);
    
    // We only review up to top 3 modified/added files to keep it fast and prevent rate limit/timeout
    const filesToReview = changedFiles
      .filter((f: any) => f.status === "modified" || f.status === "added")
      .slice(0, 3);

    if (filesToReview.length === 0) {
      throw new Error("No reviewable code files (added or modified) found in this pull request.");
    }

    const fileScores = { quality: 0, security: 0, complexity: 0, documentation: 0, count: 0 };
    const allIssues: any[] = [];
    const reviewFilesData: { filePath: string; additions: number; deletions: number; status: string; content: string }[] = [];

    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;
    let totalLatency = 0;
    let finalModelUsed = "gpt-4o";
    const aggregatedAgentLogs: any[] = [];
    let promptTemplates: any = null;
    let promptVersion = "v1.0.0";
    let finalAiSummary = "";

    // Process files sequentially to simulate agent stages and update progress
    for (let fIdx = 0; fIdx < filesToReview.length; fIdx++) {
      const file = filesToReview[fIdx];
      
      // Fetch file content at target commit
      let fileContent = "";
      try {
        fileContent = await downloadFileContent(token, owner, repoName, file.filename, headSha);
      } catch (err) {
        console.warn(`Failed to download content for file ${file.filename}:`, err);
        continue;
      }

      // Map language
      const extension = file.filename.split(".").pop() || "";
      let language = "typescript";
      if (["py", "pyw"].includes(extension)) language = "python";
      else if (["go"].includes(extension)) language = "go";
      else if (["rs"].includes(extension)) language = "rust";
      else if (["js", "jsx", "mjs"].includes(extension)) language = "javascript";

      // Call AI Review service
      // As we review files, update agent statuses to mimic progress
      const agents = job.agents;
      
      // Set Quality agent running
      agents[0].status = "running";
      agents[0].progress = 50;
      job.progress = Math.round((fIdx / filesToReview.length) * 100) + 5;
      activeJobs.set(jobId, { ...job });
      await sleep(500);

      // Fetch AI response
      const response = await fetch("http://localhost:8085/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: fileContent,
          filename: file.filename,
          language,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`AI Review Service returned ${response.status} for file ${file.filename}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let aiResult: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === "result") {
                aiResult = parsed.data;
              }
            } catch {}
          }
        }
      }

      if (!aiResult) {
        throw new Error(`AI Service did not return a valid result for file ${file.filename}`);
      }

      // Track scores and telemetry
      fileScores.quality += aiResult.quality_score;
      fileScores.security += aiResult.security_score;
      fileScores.complexity += aiResult.complexity_score;
      fileScores.documentation += aiResult.documentation_score;
      fileScores.count++;

      totalInputTokens += aiResult.input_tokens || 0;
      totalOutputTokens += aiResult.output_tokens || 0;
      totalCost += aiResult.cost || 0;
      totalLatency += aiResult.review_time_ms || 0;
      if (aiResult.model_used) {
        finalModelUsed = aiResult.model_used;
      }
      if (aiResult.agent_logs) {
        aggregatedAgentLogs.push({
          filePath: file.filename,
          logs: aiResult.agent_logs,
        });
      }
      if (aiResult.prompt_templates && !promptTemplates) {
        promptTemplates = aiResult.prompt_templates;
      }
      if (aiResult.prompt_version) {
        promptVersion = aiResult.prompt_version;
      }
      if (aiResult.ai_summary) {
        finalAiSummary = aiResult.ai_summary;
      }

      // Complete Quality, run Security
      agents[0].status = "completed";
      agents[0].progress = 100;
      agents[1].status = "running";
      agents[1].progress = 50;
      job.progress = Math.round((fIdx / filesToReview.length) * 100) + 12;
      activeJobs.set(jobId, { ...job });
      await sleep(500);

      // Collect issues
      const reviewerIssues = aiResult.reviewer?.issues || [];
      const securityIssues = aiResult.security?.issues || [];
      const complexityIssues = aiResult.complexity?.issues || [];
      
      const fileIssues = [...reviewerIssues, ...securityIssues, ...complexityIssues].map((issue: any) => ({
        filePath: file.filename,
        line: issue.line || 1,
        type: issue.category === "style" ? "style" : issue.category === "security" ? "security" : issue.category === "complexity" ? "complexity" : "bug",
        severity: issue.severity || "medium",
        message: escapeHtml(issue.description || ""),
        suggestion: escapeHtml(issue.suggestion || ""),
        codeSnippet: escapeHtml(issue.code_snippet || ""),
      }));

      allIssues.push(...fileIssues);
      reviewFilesData.push({
        filePath: file.filename,
        additions: file.additions,
        deletions: file.deletions,
        status: file.status,
        content: fileContent,
      });

      // Complete Security, run Complexity
      agents[1].status = "completed";
      agents[1].progress = 100;
      agents[2].status = "running";
      agents[2].progress = 50;
      job.progress = Math.round((fIdx / filesToReview.length) * 100) + 18;
      activeJobs.set(jobId, { ...job });
      await sleep(500);

      // Complete Complexity, run Documentation
      agents[2].status = "completed";
      agents[2].progress = 100;
      agents[3].status = "running";
      agents[3].progress = 50;
      job.progress = Math.round((fIdx / filesToReview.length) * 100) + 24;
      activeJobs.set(jobId, { ...job });
      await sleep(500);

      // Complete Documentation
      agents[3].status = "completed";
      agents[3].progress = 100;
    }

    job.progress = 95;
    activeJobs.set(jobId, { ...job });

    // Aggregate values
    const finalScores = {
      quality: Math.round(fileScores.quality / fileScores.count),
      security: Math.round(fileScores.security / fileScores.count),
      complexity: Math.round(fileScores.complexity / fileScores.count),
      documentation: Math.round(fileScores.documentation / fileScores.count),
    };

    const overallScore = Math.round(
      (finalScores.quality + finalScores.security + finalScores.complexity + finalScores.documentation) / 4
    );

    // Save final review in DB
    const [review] = await db
      .insert(reviewsTable)
      .values({
        pullRequestId: pr.id,
        pullRequestNumber: pr.number,
        repositoryName: repoName,
        author: pr.author,
        authorAvatar: pr.authorAvatar,
        qualityScore: String(finalScores.quality),
        securityScore: String(finalScores.security),
        complexityScore: String(finalScores.complexity),
        documentationScore: String(finalScores.documentation),
        status: "completed",
        aiSummary: `Review completed for ${fileScores.count} files. ` + escapeHtml(finalAiSummary),
        topIssues: JSON.stringify(
          allIssues.slice(0, 5).map((i) => ({
            severity: i.severity,
            type: i.type,
            filePath: i.filePath,
            line: i.line,
            description: i.message,
          }))
        ),
        modelUsed: finalModelUsed,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        cost: String(totalCost),
        agentOutputs: JSON.stringify(aggregatedAgentLogs),
        promptTemplates: JSON.stringify(promptTemplates),
        latencyMs: totalLatency,
      })
      .returning();

    // Save review files
    for (const fileItem of reviewFilesData) {
      const [reviewFile] = await db
        .insert(reviewFilesTable)
        .values({
          reviewId: review.id,
          filePath: fileItem.filePath,
          additions: fileItem.additions,
          deletions: fileItem.deletions,
          status: fileItem.status,
          content: fileItem.content,
        })
        .returning();

      // Save corresponding comments
      const fileComments = allIssues.filter((i) => i.filePath === fileItem.filePath);
      for (const comment of fileComments) {
        await db.insert(reviewCommentsTable).values({
          reviewId: review.id,
          filePath: fileItem.filePath,
          line: comment.line,
          type: comment.type,
          severity: comment.severity,
          message: comment.message,
          suggestion: comment.suggestion,
          codeSnippet: comment.codeSnippet,
        });

        // If security issue, save to security issues table
        if (comment.type === "security" || comment.severity === "critical" || comment.severity === "high") {
          await db.insert(securityIssuesTable).values({
            type: comment.type === "security" ? "Security Vulnerability" : "Code Issue",
            filePath: fileItem.filePath,
            line: comment.line,
            severity: comment.severity,
            description: comment.message,
            fix: comment.suggestion,
            status: "open",
            repositoryId: pr.repositoryId,
          });
        }
      }
    }

    // Save user activity item
    await db.insert(activityItemsTable).values({
      userId,
      type: "review_completed",
      description: `AI review completed for PR #${pr.number} '${pr.title}' with score ${overallScore}/100`,
      repositoryName: repoName,
    });

    // Update user stats
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (user) {
      await db
        .update(usersTable)
        .set({
          totalReviews: user.totalReviews + 1,
        })
        .where(eq(usersTable.id, userId));
    }

    // Update PR review status to completed
    await db
      .update(pullRequestsTable)
      .set({ reviewStatus: "completed" })
      .where(eq(pullRequestsTable.id, pr.id));

    // Update background job as complete
    job.status = "completed";
    job.progress = 100;
    job.reviewId = review.id;
    activeJobs.set(jobId, job);
  } catch (err: any) {
    console.error(`Review job ${jobId} failed:`, err);
    
    // Reset PR review status to pending/failed
    await db
      .update(pullRequestsTable)
      .set({ reviewStatus: "pending" })
      .where(eq(pullRequestsTable.id, pr.id));

    job.status = "failed";
    job.error = err.message || String(err);
    activeJobs.set(jobId, job);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default router;

