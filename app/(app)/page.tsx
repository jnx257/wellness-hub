import Link from "next/link";
import { requireUserId } from "@/lib/services/session";
import { getDashboardData } from "./view-model";
import type { ActivityItem } from "./view-model";
import type { GoalCard } from "./todo/view-model";

export const dynamic = "force-dynamic";

const ACTIVITY_ICON: Record<ActivityItem["type"], string> = {
  completed: "✓",
  missed: "🟠",
  journal: "✎",
};

export default async function Home() {
  const userId = await requireUserId();
  const data = await getDashboardData(userId);

  return (
    <div className="flex flex-col gap-[32px] px-[22px] pt-[4px] pb-[48px] min-[900px]:px-[4px]">
      <div>
        <div className="text-display text-primary font-bold tracking-tight">
          {data.greeting}, {data.greetingName}.
        </div>
        <div className="text-body text-text-muted mt-[4px]">
          {data.todayCount === 0
            ? "Nothing scheduled for today."
            : `${data.todayCount} task${data.todayCount === 1 ? "" : "s"} today · ${data.todayGoalLinkedCount} goal-linked`}
        </div>
      </div>

      <div className="flex flex-col gap-[12px]">
        <SectionLabel>Goals overview</SectionLabel>
        {data.goalCards.length === 0 ? (
          <p className="text-body text-text-muted">No goals yet.</p>
        ) : (
          <div className="flex gap-[14px] overflow-x-auto pb-[4px]">
            {data.goalCards.map((goal) => (
              <GoalOverviewCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-[12px]">
        <SectionLabel>Recent activity</SectionLabel>
        {data.activity.length === 0 ? (
          <p className="text-body text-text-muted">No activity yet.</p>
        ) : (
          <div className="bg-bg-surface flex flex-col rounded-xl border border-[rgba(29,69,51,0.12)] px-[16px] py-[6px]">
            {data.activity.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center gap-[12px] py-[12px] ${
                  i < data.activity.length - 1 ? "border-border-soft border-b" : ""
                }`}
              >
                <span
                  className={`flex h-[28px] w-[28px] flex-none items-center justify-center rounded-full text-[13px] ${
                    item.type === "missed"
                      ? "bg-warning/12 text-[#9A5B2A]"
                      : "bg-primary/8 text-primary"
                  }`}
                >
                  {ACTIVITY_ICON[item.type]}
                </span>
                <span className="text-body-sm text-text-primary min-w-0 flex-1 truncate">
                  {item.title}
                </span>
                <span className="text-caption text-text-faint flex-none">
                  {item.dateLabel}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-label text-text-muted font-semibold tracking-eyebrow uppercase">
      {children}
    </div>
  );
}

function GoalOverviewCard({ goal }: { goal: GoalCard }) {
  const streak = goal.drifting
    ? `${goal.missesThisWeek} misses this week`
    : goal.missesThisWeek === 1
      ? "1 miss this week"
      : "On pace";

  return (
    <Link
      href="/todo"
      className="bg-bg-surface flex w-[220px] flex-none flex-col gap-[12px] rounded-xl border border-[rgba(29,69,51,0.12)] p-[16px] no-underline"
    >
      <div className="flex items-center gap-[10px]">
        <span className="bg-bg-tab-track flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] text-[17px]">
          {goal.icon}
        </span>
        <span className="text-text-primary min-w-0 flex-1 truncate text-[14.5px] font-semibold">
          {goal.title}
        </span>
        <span
          className={`h-[8px] w-[8px] flex-none rounded-full ${
            goal.drifting ? "bg-warning" : "bg-primary"
          }`}
        />
      </div>
      <div className="flex items-center gap-[10px]">
        <span className="bg-bg-track block h-[6px] flex-1 overflow-hidden rounded-[4px]">
          <span
            className="bg-primary block h-full rounded-[4px]"
            style={{ width: `${goal.progress}%` }}
          />
        </span>
        <span className="text-primary w-[32px] flex-none text-right text-[12px] font-semibold">
          {goal.progress}%
        </span>
      </div>
      <span className="text-caption text-text-muted">{streak}</span>
    </Link>
  );
}
