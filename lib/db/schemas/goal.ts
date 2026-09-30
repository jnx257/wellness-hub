import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category"),
  period: text("period", {
    enum: ["quarterly", "monthly", "yearly"],
  }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
