import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  pullRequestId: integer("pull_request_id").notNull(),
  pullRequestNumber: integer("pull_request_number").notNull(),
  repositoryName: text("repository_name").notNull(),
  author: text("author").notNull(),
  authorAvatar: text("author_avatar"),
  qualityScore: numeric("quality_score").notNull().default("0"),
  securityScore: numeric("security_score").notNull().default("0"),
  complexityScore: numeric("complexity_score").notNull().default("0"),
  documentationScore: numeric("documentation_score").notNull().default("0"),
  status: text("status").notNull().default("completed"),
  aiSummary: text("ai_summary"),
  topIssues: text("top_issues"),
  reviewedAt: timestamp("reviewed_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, reviewedAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
