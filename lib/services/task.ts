import { db as defaultDb } from "@/lib/db";
import { tasks } from "@/lib/db/schemas";
import { and, eq, gte, lt, count } from "drizzle-orm";

const ACTIVE_TASKS_LIMIT_PER_WEEK = 5;

export async function getTaskCounter(
  goalId: number,
  scheduledFor: Date,
  db = defaultDb,
) {
  const weekStart = getWeekStart(scheduledFor);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const result = await db
    .select({ count: count() })
    .from(tasks)
    .where(
      and(
        eq(tasks.goalId, goalId),
        eq(tasks.completed, false),
        gte(tasks.scheduledFor, weekStart),
        lt(tasks.scheduledFor, weekEnd),
      ),
    );

  return result[0]?.count ?? 0;
}

export async function validateTaskLimit(
  goalId: number | undefined,
  scheduledFor: Date | undefined,
): Promise<{ valid: boolean; message?: string }> {
  if (!goalId || !scheduledFor) {
    return { valid: true };
  }

  const count = await getTaskCounter(goalId, scheduledFor);

  if (count >= ACTIVE_TASKS_LIMIT_PER_WEEK) {
    return {
      valid: false,
      message: `Goal already has ${ACTIVE_TASKS_LIMIT_PER_WEEK} active tasks this week. Complete one before adding more.`,
    };
  }

  return { valid: true };
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}
