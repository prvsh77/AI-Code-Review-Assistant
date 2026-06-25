import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const securityIssuesTable = pgTable("security_issues", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  filePath: text("file_path").notNull(),
  line: integer("line").notNull(),
  severity: text("severity").notNull().default("medium"),
  description: text("description").notNull(),
  fix: text("fix"),
  status: text("status").notNull().default("open"),
  repositoryId: integer("repository_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSecurityIssueSchema = createInsertSchema(securityIssuesTable).omit({ id: true, createdAt: true });
export type InsertSecurityIssue = z.infer<typeof insertSecurityIssueSchema>;
export type SecurityIssue = typeof securityIssuesTable.$inferSelect;
