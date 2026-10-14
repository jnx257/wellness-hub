"use server";

import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schemas";
import { createTaskSchema } from "@/lib/validations/task";
import { gte, and, lt, eq } from "drizzle-orm";
import { isInTaskLimit } from "@/lib/services/task";
import { requireUserId } from "@/lib/services/session";

export async function createTask(input: unknown, options?: { force?: boolean }) {
  const userId = await requireUserId();
  const data = createTaskSchema.parse(input);
  const scheduledFor = data.scheduledFor ?? new Date();

  if (data.goalId && !options?.force) {
    const withinLimit = await isInTaskLimit(data.goalId, scheduledFor);
    if (!withinLimit) {
      return {
        ok: false as const,
        warning:
          "This goal already has 5 active tasks this week — link anyway?",
      };
    }
  }

  const [task] = await db
    .insert(tasks)
    .values({
      userId,
      title: data.title,
      description: data.taskDescription,
      scheduledFor,
      timeOfDay: data.timeOfDay,
      deadline: data.deadline,
      goalId: data.goalId,
    })
    .returning();

  return { ok: true as const, task };
}

export async function toggleTask(taskId: number) {
  const userId = await requireUserId();
  const [existing] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!existing || existing.userId !== userId) throw new Error("Task not found");

  const [updated] = await db
    .update(tasks)
    .set({ completed: !existing.completed })
    .where(eq(tasks.id, taskId))
    .returning();

  return updated;
}

export async function rescheduleTask(taskId: number) {
  const userId = await requireUserId();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await db
    .update(tasks)
    .set({ scheduledFor: tomorrow })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
}

export async function unlinkTask(taskId: number) {
  const userId = await requireUserId();
  await db
    .update(tasks)
    .set({ goalId: null })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
}

export async function getTodayTasks() {
  const userId = await requireUserId();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        gte(tasks.scheduledFor, today),
        lt(tasks.scheduledFor, tomorrow),
      ),
    );
}
