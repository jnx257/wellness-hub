import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { goals } from "./goal";
import { tasks } from "./task";
import { users } from "./user";

export const journalEntry = pgTable("journal", {
  id: serial("id").primaryKey(),
  // Nullable until session/auth is wired into the journal actions — tighten
  // to notNull() once every insert path passes a real userId.
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  journalDescription: text("journal_description").notNull(),
  moodTag: text("mood_tag"),
  taskId: integer("task_id").references(() => tasks.id),
  goalId: integer("goal_id").references(() => goals.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
