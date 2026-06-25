import { Router } from "express";
import { db } from "@workspace/db";
import { repositoriesTable, pullRequestsTable, reviewsTable, reviewFilesTable } from "@workspace/db";
import { count } from "drizzle-orm";

const router = Router();

router.get("/analytics/dashboard", async (_req, res) => {
  const [repos] = await db.select({ count: count() }).from(repositoriesTable);
  const [prs] = await db.select({ count: count() }).from(pullRequestsTable);
  const [filesReviewed] = await db.select({ count: count() }).from(reviewFilesTable);
  const [reviews] = await db.select({ count: count() }).from(reviewsTable);

  const allReviews = await db.select().from(reviewsTable);
  const avgScore =
    allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + parseFloat(r.qualityScore as string), 0) / allReviews.length
      : 0;

  res.json({
    totalRepositories: repos.count,
    totalPullRequests: prs.count,
    filesReviewed: filesReviewed.count,
    overallScore: Math.round(avgScore * 10) / 10,
    activeReviews: 3,
    reviewsThisWeek: Math.min(reviews.count, 12),
    issuesFound: 47,
  });
});

router.get("/analytics/quality-trend", async (req, res) => {
  const days = parseInt((req.query.days as string) || "30", 10);
  const trend = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    trend.push({
      date: dateStr,
      qualityScore: 70 + Math.round(Math.random() * 20),
      securityScore: 75 + Math.round(Math.random() * 15),
      complexityScore: 60 + Math.round(Math.random() * 25),
    });
  }
  res.json(trend);
});

router.get("/analytics/language-breakdown", async (_req, res) => {
  const rows = await db.select().from(repositoriesTable);
  const langCounts: Record<string, number> = {};
  for (const r of rows) {
    langCounts[r.language] = (langCounts[r.language] || 0) + 1;
  }
  const total = rows.length || 1;
  const result = Object.entries(langCounts).map(([language, count]) => ({
    language,
    count,
    percentage: Math.round((count / total) * 100),
  }));
  res.json(result);
});

export default router;
