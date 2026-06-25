import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const activityItemsTable = pgTable("activity_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  type: text("type").notNull(),
  description: text("description").notNull(),
  repositoryName: text("repository_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertActivityItemSchema = createInsertSchema(activityItemsTable).omit({ id: true, createdAt: true });
export type InsertActivityItem = z.infer<typeof insertActivityItemSchema>;
export type ActivityItem = typeof activityItemsTable.$inferSelect;
