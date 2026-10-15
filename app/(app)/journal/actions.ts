"use server";

import { createJournalEntry } from "@/lib/services/journal-entry";
import { createJournalEntrySchema } from "@/lib/validations/journal-entry";
import { requireUserId } from "@/lib/services/session";

export async function createEntry(input: unknown) {
  const userId = await requireUserId();
  const data = createJournalEntrySchema.parse(input);

  const entry = await createJournalEntry({ ...data, userId });
  return entry;
}
