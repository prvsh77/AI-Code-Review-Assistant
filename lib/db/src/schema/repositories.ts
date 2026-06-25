import { pgTable, serial, text, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const repositoriesTable = pgTable("repositories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  language: text("language").notNull().default(""),
  stars: integer("stars").notNull().default(0),
  openPrs: integer("open_prs").notNull().default(0),
  lastReviewedAt: text("last_reviewed_at"),
  reviewScore: numeric("review_score"),
  description: text("description"),
  isPrivate: boolean("is_private").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRepositorySchema = createInsertSchema(repositoriesTable).omit({ id: true, createdAt: true });
export type InsertRepository = z.infer<typeof insertRepositorySchema>;
export type Repository = typeof repositoriesTable.$inferSelect;
