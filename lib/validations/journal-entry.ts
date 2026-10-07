import z from "zod";

export const createJournalEntrySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
  journalDescription: z.string().trim().min(1, "Description is required"),
  moodTag: z.string().trim().max(50).optional(),
  taskId: z.number().int().positive().optional(),
  goalId: z.number().int().positive().optional(),
});

export const UpdateJournalEntrySchema = createJournalEntrySchema.partial();
