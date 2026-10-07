import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  // Nullable until session/auth is wired into the todo actions — tighten to
  // notNull() once every insert path passes a real userId.
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  category: text("category"),
  period: text("period", {
    enum: ["quarterly", "monthly", "yearly"],
  }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
