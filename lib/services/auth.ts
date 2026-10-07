import { db as Database } from "@/lib/db";
import { users } from "@/lib/db/schemas";
import { eq } from "drizzle-orm";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

// Session/cookie strategy (JWT vs. DB-backed sessions, middleware) is not
// decided yet — this module only covers password hashing and user lookup.

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

  return (
    keyBuffer.length === derivedKey.length &&
    timingSafeEqual(keyBuffer, derivedKey)
  );
}

export async function findUserByEmail(email: string, db: typeof Database = Database) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user ?? null;
}

export async function createUser(
  input: { name: string; email: string; password: string; birthDate?: Date },
  db: typeof Database = Database,
) {
  const existing = await findUserByEmail(input.email, db);
  if (existing) throw new Error("An account with this email already exists.");

  const passwordHash = await hashPassword(input.password);
  const [user] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash,
      birthDate: input.birthDate?.toISOString().slice(0, 10),
    })
    .returning();

  return user;
}

export async function verifyCredentials(
  email: string,
  password: string,
  db: typeof Database = Database,
) {
  const user = await findUserByEmail(email, db);
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}
