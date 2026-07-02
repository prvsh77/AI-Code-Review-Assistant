import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireGitHubToken, AuthenticatedRequest } from "../middlewares/auth";
import { listRepositories, getRepositoryById } from "../lib/github";

const router = Router();

// Helper to format Date as "X time ago" or similar simple format
function formatReviewedAt(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

router.get("/repositories", requireGitHubToken as any, async (req: AuthenticatedRequest, res) => {
  const { language, search } = req.query as { language?: string; search?: string };
  const token = req.githubToken!;

  try {
    // 1. Fetch live repositories from GitHub
    let repos = await listRepositories(token, search);

    // 2. Filter by language if requested
    if (language && language !== "all" && language !== "All") {
      repos = repos.filter(
        (r) => r.language && r.language.toLowerCase() === language.toLowerCase()
      );
    }

    // 3. Map repositories and resolve their review history from database
    const result = await Promise.all(
      repos.map(async (r) => {
        // Query database for latest review of this repository
        const [latestReview] = await db
          .select()
          .from(reviewsTable)
          .where(eq(reviewsTable.repositoryName, r.name))
          .orderBy(desc(reviewsTable.reviewedAt))
          .limit(1);

        return {
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          language: r.language || "TypeScript", // Fallback if GitHub doesn't detect a language
          stars: r.stargazers_count || 0,
          openPrs: r.open_issues_count || 0, // Using issues + PRs count as openPRs mapping
          lastReviewedAt: latestReview ? formatReviewedAt(latestReview.reviewedAt) : null,
          reviewScore: latestReview ? parseFloat(latestReview.qualityScore) : null,
          description: r.description || "",
          isPrivate: r.private,
        };
      })
    );

    res.json(result);
  } catch (err: any) {
    req.log?.error(err, "Failed to list repositories from GitHub");
    
    if (err.code === "GITHUB_TOKEN_EXPIRED") {
      res.status(401).json({ error: "github_token_expired", message: err.message });
      return;
    }
    
    res.status(err.status || 500).json({
      error: "Failed to fetch repositories",
      detail: err.message,
    });
  }
});

router.get("/repositories/:id", requireGitHubToken as any, async (req: AuthenticatedRequest, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid repository ID" });
    return;
  }

  const token = req.githubToken!;

  try {
    const r = await getRepositoryById(token, id);

    const [latestReview] = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.repositoryName, r.name))
      .orderBy(desc(reviewsTable.reviewedAt))
      .limit(1);

    res.json({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      language: r.language || "TypeScript",
      stars: r.stargazers_count || 0,
      openPrs: r.open_issues_count || 0,
      lastReviewedAt: latestReview ? formatReviewedAt(latestReview.reviewedAt) : null,
      reviewScore: latestReview ? parseFloat(latestReview.qualityScore) : null,
      description: r.description || "",
      isPrivate: r.private,
    });
  } catch (err: any) {
    req.log?.error(err, `Failed to get repository details for ID ${id}`);
    
    if (err.code === "GITHUB_TOKEN_EXPIRED") {
      res.status(401).json({ error: "github_token_expired", message: err.message });
      return;
    }
    
    res.status(err.status || 500).json({
      error: "Failed to fetch repository details",
      detail: err.message,
    });
  }
});

export default router;

