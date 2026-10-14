"use server";

import { redirect } from "next/navigation";
import { signInSchema, signUpSchema } from "@/lib/validations/user";
import { createUser, verifyCredentials } from "@/lib/services/auth";
import { createSession, deleteSession } from "@/lib/services/session";

type AuthResult = { ok: false; error: string } | void;

export async function signIn(input: unknown): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return { ok: false, error: "Invalid email or password." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function signUp(input: unknown): Promise<AuthResult> {
  const raw = input as { birthDate?: string };
  const parsed = signUpSchema.safeParse({
    ...raw,
    birthDate: raw.birthDate ? raw.birthDate : undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let user;
  try {
    user = await createUser(parsed.data);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not create account." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
