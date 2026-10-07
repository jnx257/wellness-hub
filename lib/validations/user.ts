import z from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  birthDate: z.coerce.date().optional(),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
