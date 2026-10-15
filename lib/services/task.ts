import { db as Database } from "@/lib/db";
import { tasks } from "@/lib/db/schemas";
import { and, count, eq, gte, lt } from "drizzle-orm";

const TASK_LIMIT_BY_GOAL = 5;

export async function isInTaskLimit(
  goalId: number,
  scheduled_for: Date,
  db: typeof Database = Database,
) {
  const comecoDaSemana = getWeekStart(scheduled_for);
  const fimDaSemana = new Date(comecoDaSemana);
  fimDaSemana.setDate(fimDaSemana.getDate() + 7);

  const [{ quantasTasksTemPorEsseGoal }] = await db
    .select({ quantasTasksTemPorEsseGoal: count() })
    .from(tasks)
    .where(
      and(
        eq(tasks.goalId, goalId),
        eq(tasks.completed, false),
        gte(tasks.scheduledFor, comecoDaSemana),
        lt(tasks.scheduledFor, fimDaSemana),
      ),
    );

  return quantasTasksTemPorEsseGoal < TASK_LIMIT_BY_GOAL;
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function nextSaturday(date: Date) {
  const d = startOfDay(date);
  const daysUntilSaturday = (6 - d.getDay() + 7) % 7 || 7;
  return addDays(d, daysUntilSaturday);
}

/**
 * A plain "ask again tomorrow" bump — used on decline (explicit or lapsed)
 * so the prompt doesn't re-lapse on every page load for the rest of today
 * (scheduledFor otherwise never moves on a decline).
 */
export function tomorrowFrom(now: Date): Date {
  return addDays(startOfDay(now), 1);
}

/**
 * The concrete effect of a Daily Adjustment: this app has no "scope/duration"
 * field to shrink, so every reason resolves to a reschedule (date and,
 * for "Too tired", time-of-day) rather than literally reducing task size.
 */
export function resolveAdjustment(
  reason: string | null,
  now: Date,
): { scheduledFor: Date; timeOfDay?: "morning" } {
  if (reason === "Unexpected event") {
    return { scheduledFor: nextSaturday(now) };
  }
  if (reason === "Too tired") {
    return { scheduledFor: addDays(startOfDay(now), 1), timeOfDay: "morning" };
  }
  return { scheduledFor: addDays(startOfDay(now), 1) };
}
