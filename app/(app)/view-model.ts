import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { goals as goalsTable, tasks as tasksTable, users } from "@/lib/db/schemas";
import { buildGoalCards, isMissed, type GoalCard } from "@/lib/services/goal-card";
import { getJournalEntriesByUser } from "@/lib/services/journal-entry";

export type ActivityItem = {
  id: string;
  type: "completed" | "missed" | "journal";
  title: string;
  dateLabel: string;
  date: Date;
};

export type DashboardData = {
  greeting: string;
  greetingName: string;
  todayCount: number;
  todayGoalLinkedCount: number;
  goalCards: GoalCard[];
  activity: ActivityItem[];
};

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

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function dateLabel(date: Date, now: Date) {
  const diffDays = Math.round(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function getDashboardData(
  userId: number,
  now = new Date(),
): Promise<DashboardData> {
  const [[user], goals, tasks, journalEntries] = await Promise.all([
    db.select({ name: users.name }).from(users).where(eq(users.id, userId)),
    db.select().from(goalsTable).where(eq(goalsTable.userId, userId)),
    db.select().from(tasksTable).where(eq(tasksTable.userId, userId)),
    getJournalEntriesByUser(userId),
  ]);

  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const sevenDaysAgo = addDays(today, -7);

  const todayTasks = tasks.filter(
    (t) => !!t.scheduledFor && t.scheduledFor >= today && t.scheduledFor < tomorrow,
  );

  // Approximated by scheduledFor — tasks have no "completed at" timestamp,
  // so "recent" means "was due recently," not the exact moment it was toggled.
  const activity: ActivityItem[] = [];

  for (const task of tasks) {
    if (!task.scheduledFor || task.scheduledFor < sevenDaysAgo || task.scheduledFor >= tomorrow) {
      continue;
    }
    if (task.completed) {
      activity.push({
        id: `task-done-${task.id}`,
        type: "completed",
        title: task.title,
        date: task.scheduledFor,
        dateLabel: dateLabel(task.scheduledFor, now),
      });
    } else if (isMissed(task, now)) {
      activity.push({
        id: `task-missed-${task.id}`,
        type: "missed",
        title: task.title,
        date: task.scheduledFor,
        dateLabel: dateLabel(task.scheduledFor, now),
      });
    }
  }

  for (const entry of journalEntries) {
    if (entry.createdAt < sevenDaysAgo) continue;
    activity.push({
      id: `journal-${entry.id}`,
      type: "journal",
      title: entry.title,
      date: entry.createdAt,
      dateLabel: dateLabel(entry.createdAt, now),
    });
  }

  activity.sort((a, b) => b.date.getTime() - a.date.getTime());

  return {
    greeting: greetingForHour(now.getHours()),
    greetingName: user?.name?.split(" ")[0] ?? "there",
    todayCount: todayTasks.length,
    todayGoalLinkedCount: todayTasks.filter((t) => !!t.goalId).length,
    goalCards: buildGoalCards(goals, tasks, now),
    activity: activity.slice(0, 10),
  };
}
