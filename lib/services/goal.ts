import { db as Database } from "@/lib/db";
import { goals, tasks } from "@/lib/db/schemas";
import { and, count, eq } from "drizzle-orm";

export async function createGoal(
  input: {
    userId?: number;
    title: string;
    category?: string;
    period: "quarterly" | "monthly" | "yearly";
  },
  db: typeof Database = Database,
) {
  const [goal] = await db.insert(goals).values(input).returning();
  return goal;
}

export async function getGoalsByUser(userId: number, db: typeof Database = Database) {
  return db.select().from(goals).where(eq(goals.userId, userId));
}

/** Percentage of linked tasks completed for a goal (tasks completed / total tasks). */
export async function getGoalProgress(goalId: number, db: typeof Database = Database) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(tasks)
    .where(eq(tasks.goalId, goalId));

  if (total === 0) return 0;

  const [{ completed }] = await db
    .select({ completed: count() })
    .from(tasks)
    .where(and(eq(tasks.goalId, goalId), eq(tasks.completed, true)));

  return Math.round((completed / total) * 100);
}
