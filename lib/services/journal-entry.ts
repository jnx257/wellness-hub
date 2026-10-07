import { db as Database } from "@/lib/db";
import { journalEntry } from "@/lib/db/schemas";
import { desc, eq } from "drizzle-orm";

export async function createJournalEntry(
  input: {
    userId?: number;
    title: string;
    journalDescription: string;
    moodTag?: string;
    taskId?: number;
    goalId?: number;
  },
  db: typeof Database = Database,
) {
  const [entry] = await db.insert(journalEntry).values(input).returning();
  return entry;
}

export async function getJournalEntriesByUser(
  userId: number,
  db: typeof Database = Database,
) {
  return db
    .select()
    .from(journalEntry)
    .where(eq(journalEntry.userId, userId))
    .orderBy(desc(journalEntry.createdAt));
}
