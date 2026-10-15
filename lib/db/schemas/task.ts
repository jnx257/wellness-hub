import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { goals } from "./goal";
import { users } from "./user";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  // Nullable until session/auth is wired into the todo actions — tighten to
  // notNull() once every insert path passes a real userId.
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").notNull().default(false),
  scheduledFor: timestamp("scheduled_for"),
  timeOfDay: text("time_of_day", {
    enum: ["morning", "afternoon", "evening"],
  }),
  deadline: timestamp("deadline"),
  goalId: integer("goal_id").references(() => goals.id),
  // Failure feedback loop (Goal -> Task -> Failure -> Reflection -> Adjustment)
  missedReason: text("missed_reason"),
  adjustmentStatus: text("adjustment_status", {
    enum: ["none", "suggested", "accepted", "declined", "auto_applied"],
  })
    .notNull()
    .default("none"),
  declinedAdjustmentCount: integer("declined_adjustment_count")
    .notNull()
    .default(0),
  // When adjustmentStatus last changed — lets the lapse sweep tell "just set
  // this today" apart from "still pending since an earlier day" without a
  // cron job (see reconcileLapsedSuggestions in todo/view-model.ts).
  adjustmentUpdatedAt: timestamp("adjustment_updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
