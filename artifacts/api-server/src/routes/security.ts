import { Router } from "express";
import { db } from "@workspace/db";
import { securityIssuesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/security/summary", async (_req, res) => {
  const rows = await db.select().from(securityIssuesTable);
  const summary = { critical: 0, high: 0, medium: 0, low: 0, total: rows.length };
  for (const row of rows) {
    if (row.severity === "critical") summary.critical++;
    else if (row.severity === "high") summary.high++;
    else if (row.severity === "medium") summary.medium++;
    else if (row.severity === "low") summary.low++;
  }
  res.json(summary);
});

router.get("/security/issues", async (req, res) => {
  const { severity, repositoryId } = req.query as { severity?: string; repositoryId?: string };

  let rows = await db.select().from(securityIssuesTable);

  if (severity) rows = rows.filter((r) => r.severity === severity);
  if (repositoryId) rows = rows.filter((r) => r.repositoryId === parseInt(repositoryId, 10));

  res.json(
    rows.map((r) => ({
      id: r.id,
      type: r.type,
      filePath: r.filePath,
      line: r.line,
      severity: r.severity,
      description: r.description,
      fix: r.fix,
      status: r.status,
      repositoryId: r.repositoryId,
    }))
  );
});

export default router;
