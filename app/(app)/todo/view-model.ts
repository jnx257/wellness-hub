import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { goals as goalsTable, tasks as tasksTable } from "@/lib/db/schemas";
import { getWeekStart, resolveAdjustment } from "@/lib/services/task";
import {
  buildGoalCards,
  goalIcon,
  isMissed,
  type GoalCard,
} from "@/lib/services/goal-card";

type TaskRow = typeof tasksTable.$inferSelect;
type GoalRow = typeof goalsTable.$inferSelect;
type TimeOfDay = NonNullable<TaskRow["timeOfDay"]>;
type AdjustmentStatus = TaskRow["adjustmentStatus"];

const DECLINE_LIMIT = 3;

export type TodoTask = {
  id: number;
  title: string;
  done: boolean;
  milestone: boolean;
  missed: boolean;
  deadlineLabel: string | null;
  goalLabel: string | null;
  missedReason: string | null;
  adjustmentStatus: AdjustmentStatus;
};

export type TaskGroup = { period: string; tasks: TodoTask[] };

export type { GoalCard };

export type TodoData = {
  dateLabel: string;
  dailyGroups: TaskGroup[];
  weeklyGroups: TaskGroup[];
  goals: GoalCard[];
};

const TIME_OF_DAY: { key: TimeOfDay; label: string; endsAtHour: number }[] = [
  { key: "morning", label: "Morning", endsAtHour: 12 },
  { key: "afternoon", label: "Afternoon", endsAtHour: 18 },
  { key: "evening", label: "Evening", endsAtHour: 24 },
];

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

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

function toTodoTask(task: TaskRow, goalById: Map<number, GoalRow>, now: Date): TodoTask {
  const goal = task.goalId ? goalById.get(task.goalId) : undefined;
  return {
    id: task.id,
    title: task.title,
    done: task.completed,
    milestone: !!goal,
    missed: isMissed(task, now),
    deadlineLabel: task.deadline
      ? task.deadline.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        })
      : null,
    goalLabel: goal ? `${goalIcon(goal.category)} ${goal.title}` : null,
    missedReason: task.missedReason,
    adjustmentStatus: task.adjustmentStatus,
  };
}

/**
 * "Not responding by end of day counts the same as an explicit decline"
 * (project.md). Runs lazily on every read instead of a cron job: any task
 * still awaiting a response ("none"/"suggested") whose status hasn't been
 * touched since before today is treated as one lapsed cycle, same 3-strike
 * auto-apply rule as an explicit decline. Keyed off `adjustmentUpdatedAt`
 * (not `scheduledFor`, which a plain decline/lapse never moves) so a status
 * set earlier *today* doesn't immediately re-lapse on the next read.
 * Mutates `tasks` in place so this request's render already reflects the
 * reconciled state.
 */
async function reconcileLapsedSuggestions(tasks: TaskRow[], today: Date, now: Date) {
  const updates: Promise<unknown>[] = [];

  for (const task of tasks) {
    if (task.completed) continue;
    if (task.adjustmentStatus !== "none" && task.adjustmentStatus !== "suggested") continue;
    if (startOfDay(task.adjustmentUpdatedAt) >= today) continue;

    const nextCount = task.declinedAdjustmentCount + 1;

    if (nextCount >= DECLINE_LIMIT) {
      const adjustment = resolveAdjustment(task.missedReason, now);
      task.scheduledFor = adjustment.scheduledFor;
      task.timeOfDay = adjustment.timeOfDay ?? task.timeOfDay;
      task.adjustmentStatus = "auto_applied";
      task.declinedAdjustmentCount = 0;
      task.adjustmentUpdatedAt = now;
      updates.push(
        db
          .update(tasksTable)
          .set({
            scheduledFor: task.scheduledFor,
            timeOfDay: task.timeOfDay,
            adjustmentStatus: "auto_applied",
            declinedAdjustmentCount: 0,
            adjustmentUpdatedAt: now,
          })
          .where(eq(tasksTable.id, task.id)),
      );
    } else {
      task.scheduledFor = addDays(today, 1);
      task.adjustmentStatus = "declined";
      task.declinedAdjustmentCount = nextCount;
      task.adjustmentUpdatedAt = now;
      updates.push(
        db
          .update(tasksTable)
          .set({
            scheduledFor: task.scheduledFor,
            adjustmentStatus: "declined",
            declinedAdjustmentCount: nextCount,
            adjustmentUpdatedAt: now,
          })
          .where(eq(tasksTable.id, task.id)),
      );
    }
  }

  await Promise.all(updates);
}

export async function getTodoData(
  userId: number,
  now = new Date(),
): Promise<TodoData> {
  const [goals, tasks] = await Promise.all([
    db.select().from(goalsTable).where(eq(goalsTable.userId, userId)),
    db.select().from(tasksTable).where(eq(tasksTable.userId, userId)),
  ]);

  const goalById = new Map(goals.map((g) => [g.id, g]));
  const today = startOfDay(now);
  await reconcileLapsedSuggestions(tasks, today, now);
  const tomorrow = addDays(today, 1);
  const weekStart = getWeekStart(now);
  const weekEnd = addDays(weekStart, 7);

  const inRange = (t: TaskRow, from: Date, to: Date) =>
    !!t.scheduledFor && t.scheduledFor >= from && t.scheduledFor < to;

  const todayTasks = tasks.filter((t) => inRange(t, today, tomorrow));
  const dailyGroups: TaskGroup[] = [
    ...TIME_OF_DAY.map(({ key, label }) => ({
      period: label,
      tasks: todayTasks.filter((t) => t.timeOfDay === key),
    })),
    { period: "Anytime", tasks: todayTasks.filter((t) => !t.timeOfDay) },
  ]
    .filter((g) => g.tasks.length > 0)
    .map((g) => ({
      period: g.period,
      tasks: g.tasks.map((t) => toTodoTask(t, goalById, now)),
    }));

  const weekTasks = tasks.filter((t) => inRange(t, weekStart, weekEnd));
  const weeklyGroups: TaskGroup[] = WEEKDAYS.map((label, i) => {
    const dayStart = addDays(weekStart, i);
    return {
      period: label,
      tasks: weekTasks
        .filter((t) => inRange(t, dayStart, addDays(dayStart, 1)))
        .map((t) => toTodoTask(t, goalById, now)),
    };
  }).filter((g) => g.tasks.length > 0);

  const goalCards = buildGoalCards(goals, tasks, now);

  return {
    dateLabel: now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    dailyGroups,
    weeklyGroups,
    goals: goalCards,
  };
}
