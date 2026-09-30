import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { goals } from "./goal";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  scheduledFor: timestamp("scheduled_for"),
  goalId: integer("goal_id").references(() => goals.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
