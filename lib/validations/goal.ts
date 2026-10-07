import z from "zod";

export const createGoalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
  category: z.string().trim().max(100).optional(),
  period: z.enum(["quarterly", "monthly", "yearly"]),
});

export const UpdateGoalSchema = createGoalSchema.partial();
