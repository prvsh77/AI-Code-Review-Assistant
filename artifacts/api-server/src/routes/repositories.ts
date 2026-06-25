import { Router } from "express";
import { db } from "@workspace/db";
import { repositoriesTable } from "@workspace/db";
import { eq, like, sql } from "drizzle-orm";

const router = Router();

router.get("/repositories", async (req, res) => {
  const { language, search } = req.query as { language?: string; search?: string };

  let rows = await db.select().from(repositoriesTable);

  if (language && language !== "all") {
    rows = rows.filter((r) => r.language.toLowerCase() === language.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.fullName.toLowerCase().includes(q));
  }

  const result = rows.map((r) => ({
    id: r.id,
    name: r.name,
    fullName: r.fullName,
    language: r.language,
    stars: r.stars,
    openPrs: r.openPrs,
    lastReviewedAt: r.lastReviewedAt,
    reviewScore: r.reviewScore ? parseFloat(r.reviewScore) : null,
    description: r.description,
    isPrivate: r.isPrivate,
  }));

  res.json(result);
});

router.get("/repositories/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const [row] = await db.select().from(repositoriesTable).where(eq(repositoriesTable.id, id));
  if (!row) return res.status(404).json({ error: "Not found" });

  res.json({
    id: row.id,
    name: row.name,
    fullName: row.fullName,
    language: row.language,
    stars: row.stars,
    openPrs: row.openPrs,
    lastReviewedAt: row.lastReviewedAt,
    reviewScore: row.reviewScore ? parseFloat(row.reviewScore) : null,
    description: row.description,
    isPrivate: row.isPrivate,
  });
});

export default router;
