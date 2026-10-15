import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { goals as goalsTable, tasks as tasksTable } from "@/lib/db/schemas";
import { getJournalEntriesByUser } from "@/lib/services/journal-entry";
import { goalIcon } from "@/lib/services/goal-card";

export type JournalEntryView = {
  id: number;
  title: string;
  body: string;
  moodTag: string | null;
  dateLabel: string;
  isGoalLinked: boolean;
  linkLabel: string | null;
};

export type InboundContext = {
  taskId: number;
  taskTitle: string;
  goalId: number | null;
  goalLabel: string | null;
  reason: string | null;
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export async function getJournalData(userId: number): Promise<JournalEntryView[]> {
  const [entries, goals, tasks] = await Promise.all([
    getJournalEntriesByUser(userId),
    db.select().from(goalsTable).where(eq(goalsTable.userId, userId)),
    db.select().from(tasksTable).where(eq(tasksTable.userId, userId)),
  ]);

  const goalById = new Map(goals.map((g) => [g.id, g]));
  const taskById = new Map(tasks.map((t) => [t.id, t]));

  return entries.map((entry) => {
    const goal = entry.goalId ? goalById.get(entry.goalId) : undefined;
    const task = entry.taskId ? taskById.get(entry.taskId) : undefined;

    let linkLabel: string | null = null;
    if (goal) {
      linkLabel = task ? `${goalIcon(goal.category)} ${goal.title} — ${task.title}` : `${goalIcon(goal.category)} ${goal.title}`;
    } else if (task) {
      linkLabel = task.title;
    }

    return {
      id: entry.id,
      title: entry.title,
      body: entry.journalDescription,
      moodTag: entry.moodTag,
      dateLabel: formatDate(entry.createdAt),
      isGoalLinked: !!entry.goalId,
      linkLabel,
    };
  });
}

export async function getInboundContext(
  userId: number,
  taskId: number,
): Promise<InboundContext | null> {
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId));
  if (!task || task.userId !== userId) return null;

  const goal = task.goalId
    ? (await db.select().from(goalsTable).where(eq(goalsTable.id, task.goalId)))[0]
    : undefined;

  return {
    taskId: task.id,
    taskTitle: task.title,
    goalId: goal?.id ?? null,
    goalLabel: goal ? `${goalIcon(goal.category)} ${goal.title}` : null,
    reason: task.missedReason,
  };
}
