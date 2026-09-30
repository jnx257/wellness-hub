import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const journalEntry = pgTable("journal", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  journalDescription: text("journal_description").notNull(),
  //ToDo
});
