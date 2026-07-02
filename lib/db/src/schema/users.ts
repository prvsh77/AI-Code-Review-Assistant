import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  githubUsername: text("github_username"),
  githubAccessToken: text("github_access_token"),
  avatarUrl: text("avatar_url"),
  company: text("company"),
  timezone: text("timezone"),
  passwordHash: text("password_hash"),
  githubId: text("github_id"),
  totalReviews: integer("total_reviews").notNull().default(0),
  totalRepositories: integer("total_repositories").notNull().default(0),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, joinedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
