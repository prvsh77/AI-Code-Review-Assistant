import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pullRequestsTable = pgTable("pull_requests", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  authorAvatar: text("author_avatar"),
  repositoryId: integer("repository_id").notNull(),
  repositoryName: text("repository_name").notNull(),
  filesChanged: integer("files_changed").notNull().default(0),
  commits: integer("commits").notNull().default(1),
  status: text("status").notNull().default("open"),
  reviewStatus: text("review_status"),
  sourceBranch: text("source_branch"),
  targetBranch: text("target_branch"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPullRequestSchema = createInsertSchema(pullRequestsTable).omit({ id: true, createdAt: true });
export type InsertPullRequest = z.infer<typeof insertPullRequestSchema>;
export type PullRequest = typeof pullRequestsTable.$inferSelect;
