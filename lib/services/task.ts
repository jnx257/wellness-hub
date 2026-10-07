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
