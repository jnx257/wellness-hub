"use server";

import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schemas";
import { createTaskSchema } from "@/lib/validations/task";
import { or, isNull, gte, and, lt, eq } from "drizzle-orm";
import { validateTaskLimit } from "@/lib/services/task";

export async function createTask(input: unknown) {
  const data = createTaskSchema.parse(input);

  const validation = await validateTaskLimit(data.goalId, data.scheduledFor);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const [task] = await db
    .insert(tasks)
    .values({
      title: data.title,
      description: data.taskDescription,
      scheduledFor: data.scheduledFor,
      goalId: data.goalId,
    })
    .returning();

  return task;
}

export async function getTodayTasks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTasks = await db
    .select()
    .from(tasks)
    .where(
      and(gte(tasks.scheduledFor, today), lt(tasks.scheduledFor, tomorrow)),
    );

  return todayTasks;
}
