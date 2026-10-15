import { goals as goalsTable, tasks as tasksTable } from "@/lib/db/schemas";
import { getWeekStart } from "@/lib/services/task";

type TaskRow = typeof tasksTable.$inferSelect;
type GoalRow = typeof goalsTable.$inferSelect;

export type GoalCard = {
  id: number;
  icon: string;
  title: string;
  horizon: string;
  progress: number;
  drifting: boolean;
  missesThisWeek: number;
  activeThisWeek: number;
  tasks: { id: number; title: string; done: boolean }[];
};

const GOAL_ICONS: Record<string, string> = {
  music: "🎵",
  piano: "🎹",
  fitness: "🏃",
  running: "🏃",
  reading: "📚",
};

export function goalIcon(category: string | null) {
  return (category && GOAL_ICONS[category.toLowerCase()]) ?? "🎯";
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

const TIME_OF_DAY_ENDS_AT: Record<string, number> = {
  morning: 12,
  afternoon: 18,
  evening: 24,
};

export function isMissed(task: TaskRow, now: Date) {
  if (!task.goalId || task.completed) return false;

  // Deadlines come from a date-only input (UTC midnight); treat them as due end of that day.
  if (task.deadline && addDays(task.deadline, 1) <= now) return true;
  if (!task.scheduledFor) return false;

  const today = startOfDay(now);
  if (task.scheduledFor < today) return true;

  const endsAtHour = task.timeOfDay ? TIME_OF_DAY_ENDS_AT[task.timeOfDay] : undefined;
  return (
    endsAtHour !== undefined &&
    task.scheduledFor < addDays(today, 1) &&
    now.getHours() >= endsAtHour
  );
}

export function isResolved(task: TaskRow) {
  return task.adjustmentStatus === "accepted" || task.adjustmentStatus === "auto_applied";
}

/**
 * Goal Card data shared by the Todo "Goals" tab and the Dashboard's Goals
 * Overview — same drift rule in both places (project.md: >=2 misses in the
 * trailing 7 days AND at least one still unresolved).
 */
export function buildGoalCards(goals: GoalRow[], tasks: TaskRow[], now: Date): GoalCard[] {
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const weekStart = getWeekStart(now);
  const weekEnd = addDays(weekStart, 7);
  const sevenDaysAgo = addDays(today, -7);

  const inRange = (t: TaskRow, from: Date, to: Date) =>
    !!t.scheduledFor && t.scheduledFor >= from && t.scheduledFor < to;

  return goals.map((goal) => {
    const linked = tasks.filter((t) => t.goalId === goal.id);
    const doneCount = linked.filter((t) => t.completed).length;
    const recentMisses = linked.filter(
      (t) => inRange(t, sevenDaysAgo, tomorrow) && isMissed(t, now),
    );
    const missesThisWeek = recentMisses.length;
    const hasUnresolvedMiss = recentMisses.some((t) => !isResolved(t));

    return {
      id: goal.id,
      icon: goalIcon(goal.category),
      title: goal.title,
      horizon: goal.period.charAt(0).toUpperCase() + goal.period.slice(1),
      progress: linked.length
        ? Math.round((doneCount / linked.length) * 100)
        : 0,
      drifting: missesThisWeek >= 2 && hasUnresolvedMiss,
      missesThisWeek,
      activeThisWeek: linked.filter(
        (t) => !t.completed && inRange(t, weekStart, weekEnd),
      ).length,
      tasks: linked.map((t) => ({ id: t.id, title: t.title, done: t.completed })),
    };
  });
}
