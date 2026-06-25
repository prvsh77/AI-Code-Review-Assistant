import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable, reviewFilesTable, reviewCommentsTable } from "@workspace/db";
import { eq, desc, like } from "drizzle-orm";

const router = Router();

router.get("/reviews/history", async (req, res) => {
  const { search, limit } = req.query as { search?: string; limit?: string };
  const lim = limit ? parseInt(limit, 10) : 50;

  let rows = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.reviewedAt)).limit(lim);

  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(
      (r) => r.repositoryName.toLowerCase().includes(q) || r.author.toLowerCase().includes(q)
    );
  }

  res.json(
    rows.map((r) => ({
      id: r.id,
      pullRequestNumber: r.pullRequestNumber,
      repositoryName: r.repositoryName,
      score: parseFloat(r.qualityScore as string),
      status: r.status,
      reviewedAt: r.reviewedAt.toISOString(),
      author: r.author,
    }))
  );
});

router.get("/reviews", async (req, res) => {
  const { repositoryId, limit } = req.query as { repositoryId?: string; limit?: string };
  const lim = limit ? parseInt(limit, 10) : 20;

  let rows = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.reviewedAt)).limit(lim);

  const result = rows.map((r) => ({
    id: r.id,
    pullRequestId: r.pullRequestId,
    pullRequestNumber: r.pullRequestNumber,
    repositoryName: r.repositoryName,
    author: r.author,
    authorAvatar: r.authorAvatar,
    qualityScore: parseFloat(r.qualityScore as string),
    securityScore: parseFloat(r.securityScore as string),
    complexityScore: parseFloat(r.complexityScore as string),
    documentationScore: parseFloat(r.documentationScore as string),
    status: r.status,
    reviewedAt: r.reviewedAt.toISOString(),
    aiSummary: r.aiSummary,
    topIssues: r.topIssues ? JSON.parse(r.topIssues) : [],
  }));

  res.json(result);
});

router.get("/reviews/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const [row] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, id));
  if (!row) return res.status(404).json({ error: "Not found" });

  res.json({
    id: row.id,
    pullRequestId: row.pullRequestId,
    pullRequestNumber: row.pullRequestNumber,
    repositoryName: row.repositoryName,
    author: row.author,
    authorAvatar: row.authorAvatar,
    qualityScore: parseFloat(row.qualityScore as string),
    securityScore: parseFloat(row.securityScore as string),
    complexityScore: parseFloat(row.complexityScore as string),
    documentationScore: parseFloat(row.documentationScore as string),
    status: row.status,
    reviewedAt: row.reviewedAt.toISOString(),
    aiSummary: row.aiSummary,
    topIssues: row.topIssues ? JSON.parse(row.topIssues) : [],
  });
});

router.get("/reviews/:id/files", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const rows = await db.select().from(reviewFilesTable).where(eq(reviewFilesTable.reviewId, id));
  res.json(
    rows.map((r) => ({
      id: r.id,
      reviewId: r.reviewId,
      filePath: r.filePath,
      additions: r.additions,
      deletions: r.deletions,
      status: r.status,
    }))
  );
});

router.get("/reviews/:id/comments", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const rows = await db.select().from(reviewCommentsTable).where(eq(reviewCommentsTable.reviewId, id));
  res.json(
    rows.map((r) => ({
      id: r.id,
      reviewId: r.reviewId,
      filePath: r.filePath,
      line: r.line,
      type: r.type,
      severity: r.severity,
      message: r.message,
      suggestion: r.suggestion,
      codeSnippet: r.codeSnippet,
    }))
  );
});

export default router;
