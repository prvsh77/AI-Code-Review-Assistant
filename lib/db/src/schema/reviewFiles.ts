import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reviewFilesTable = pgTable("review_files", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").notNull(),
  filePath: text("file_path").notNull(),
  additions: integer("additions").notNull().default(0),
  deletions: integer("deletions").notNull().default(0),
  status: text("status").notNull().default("modified"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewFileSchema = createInsertSchema(reviewFilesTable).omit({ id: true, createdAt: true });
export type InsertReviewFile = z.infer<typeof insertReviewFileSchema>;
export type ReviewFile = typeof reviewFilesTable.$inferSelect;
