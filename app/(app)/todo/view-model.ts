import { db } from "@/lib/db";
import { goals as goalsTable, tasks as tasksTable } from "@/lib/db/schemas";
import { getWeekStart } from "@/lib/services/task";

type TaskRow = typeof tasksTable.$inferSelect;
type GoalRow = typeof goalsTable.$inferSelect;
type TimeOfDay = NonNullable<TaskRow["timeOfDay"]>;

export type TodoTask = {
  id: number;
  title: string;
  done: boolean;
  milestone: boolean;
  missed: boolean;
  deadlineLabel: string | null;
  goalLabel: string | null;
};

export type TaskGroup = { period: string; tasks: TodoTask[] };

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

const GOAL_ICONS: Record<string, string> = {
  music: "🎵",
  piano: "🎹",
  fitness: "🏃",
  running: "🏃",
  reading: "📚",
};

function goalIcon(category: string | null) {
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

function isMissed(task: TaskRow, now: Date) {
  if (!task.goalId || task.completed) return false;

  // Deadlines come from a date-only input (UTC midnight); treat them as due end of that day.
  if (task.deadline && addDays(task.deadline, 1) <= now) return true;
  if (!task.scheduledFor) return false;

  const today = startOfDay(now);
  if (task.scheduledFor < today) return true;

  const slot = TIME_OF_DAY.find((t) => t.key === task.timeOfDay);
  return (
    !!slot &&
    task.scheduledFor < addDays(today, 1) &&
    now.getHours() >= slot.endsAtHour
  );
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
  };
}

export async function getTodoData(now = new Date()): Promise<TodoData> {
  const [goals, tasks] = await Promise.all([
    db.select().from(goalsTable),
    db.select().from(tasksTable),
  ]);

  const goalById = new Map(goals.map((g) => [g.id, g]));
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const weekStart = getWeekStart(now);
  const weekEnd = addDays(weekStart, 7);
  const sevenDaysAgo = addDays(today, -7);

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

  const goalCards: GoalCard[] = goals.map((goal) => {
    const linked = tasks.filter((t) => t.goalId === goal.id);
    const doneCount = linked.filter((t) => t.completed).length;
    // We don't persist whether a miss's feedback loop was resolved yet,
    // so every recent miss counts toward drift.
    const missesThisWeek = linked.filter(
      (t) => inRange(t, sevenDaysAgo, tomorrow) && isMissed(t, now),
    ).length;

    return {
      id: goal.id,
      icon: goalIcon(goal.category),
      title: goal.title,
      horizon: goal.period.charAt(0).toUpperCase() + goal.period.slice(1),
      progress: linked.length
        ? Math.round((doneCount / linked.length) * 100)
        : 0,
      drifting: missesThisWeek >= 2,
      missesThisWeek,
      activeThisWeek: linked.filter(
        (t) => !t.completed && inRange(t, weekStart, weekEnd),
      ).length,
      tasks: linked.map((t) => ({ id: t.id, title: t.title, done: t.completed })),
    };
  });

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
