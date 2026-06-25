import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reviewCommentsTable = pgTable("review_comments", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").notNull(),
  filePath: text("file_path").notNull(),
  line: integer("line").notNull(),
  type: text("type").notNull().default("bug"),
  severity: text("severity").notNull().default("medium"),
  message: text("message").notNull(),
  suggestion: text("suggestion"),
  codeSnippet: text("code_snippet"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewCommentSchema = createInsertSchema(reviewCommentsTable).omit({ id: true, createdAt: true });
export type InsertReviewComment = z.infer<typeof insertReviewCommentSchema>;
export type ReviewComment = typeof reviewCommentsTable.$inferSelect;
