import { Router } from "express";
import { db } from "@workspace/db";
import { pullRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/pull-requests", async (req, res) => {
  const { status, repositoryId } = req.query as { status?: string; repositoryId?: string };

  let rows = await db.select().from(pullRequestsTable);

  if (status) rows = rows.filter((r) => r.status === status);
  if (repositoryId) rows = rows.filter((r) => r.repositoryId === parseInt(repositoryId, 10));

  const result = rows.map((r) => ({
    id: r.id,
    number: r.number,
    title: r.title,
    author: r.author,
    authorAvatar: r.authorAvatar,
    repositoryId: r.repositoryId,
    repositoryName: r.repositoryName,
    filesChanged: r.filesChanged,
    commits: r.commits,
    status: r.status,
    reviewStatus: r.reviewStatus,
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(result);
});

router.get("/pull-requests/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const [row] = await db.select().from(pullRequestsTable).where(eq(pullRequestsTable.id, id));
  if (!row) return res.status(404).json({ error: "Not found" });

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
});

router.post("/pull-requests/:id/trigger-review", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  await db
    .update(pullRequestsTable)
    .set({ reviewStatus: "analyzing" })
    .where(eq(pullRequestsTable.id, id));

  res.status(202).json({
    jobId: `job-${id}-${Date.now()}`,
    pullRequestId: id,
    status: "analyzing",
    progress: 0,
    agents: [
      { name: "Reviewer Agent", status: "running", progress: 30 },
      { name: "Security Agent", status: "waiting", progress: null },
      { name: "Complexity Agent", status: "waiting", progress: null },
      { name: "Documentation Agent", status: "waiting", progress: null },
    ],
  });
});

export default router;
