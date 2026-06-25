import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, activityItemsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/user/profile", async (_req, res) => {
  const [user] = await db.select().from(usersTable).limit(1);
  if (!user) {
    return res.json({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      githubUsername: "johndoe",
      avatarUrl: null,
      company: "Acme Inc.",
      timezone: "UTC-5 (Eastern Time, US & Canada)",
      joinedAt: new Date("2024-03-01").toISOString(),
      totalReviews: 156,
      totalRepositories: 12,
    });
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    githubUsername: user.githubUsername,
    avatarUrl: user.avatarUrl,
    company: user.company,
    timezone: user.timezone,
    joinedAt: user.joinedAt.toISOString(),
    totalReviews: user.totalReviews,
    totalRepositories: user.totalRepositories,
  });
});

router.get("/user/activity", async (_req, res) => {
  const rows = await db.select().from(activityItemsTable).orderBy(desc(activityItemsTable.createdAt)).limit(20);
  res.json(
    rows.map((r) => ({
      id: r.id,
      type: r.type,
      description: r.description,
      repositoryName: r.repositoryName,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

export default router;
