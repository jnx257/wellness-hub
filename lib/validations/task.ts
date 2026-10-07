import z from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
  taskDescription: z.string().optional(),
  scheduledFor: z.coerce.date().optional(),
  timeOfDay: z.enum(["morning", "afternoon", "evening"]).optional(),
  deadline: z.coerce.date().optional(),
  goalId: z.number().int().positive().optional(),
});

export const UpdateTaskSchema = createTaskSchema.partial();
