"use client";

import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  acceptAdjustment,
  createTask,
  declineAdjustment,
  rescheduleTask,
  setMissedReason,
  toggleTask,
  unlinkTask,
} from "./actions";
import type { GoalCard, TaskGroup, TodoData, TodoTask } from "./view-model";

type Tab = "Daily" | "Weekly" | "Goals";
type Period = "Morning" | "Afternoon" | "Evening";

const REASONS = ["No time", "Too tired", "Lost motivation", "Unexpected event"];

const SUGGESTIONS: Record<string, [offer: string, confirmation: string]> = {
  "No time": [
    "Shrink it instead of skipping: a 15-minute version tomorrow?",
    "Tomorrow: 15-minute version scheduled",
  ],
  "Too tired": [
    "Move it to the morning, when your energy is higher?",
    "Moved to tomorrow morning",
  ],
  "Lost motivation": [
    "Start smaller: just the first 5 minutes tomorrow?",
    "Tomorrow: 5-minute starter step",
  ],
  "Unexpected event": [
    "Reschedule it to Saturday so the week stays on track?",
    "Rescheduled to Saturday",
  ],
};
const DEFAULT_SUGGESTION: [string, string] = [
  "Reschedule it to tomorrow, same time?",
  "Rescheduled to tomorrow",
];

const GOAL_LIMIT = 5;

export function TodoView({
  dateLabel,
  dailyGroups,
  weeklyGroups,
  goals,
}: TodoData) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [tab, setTab] = useState<Tab>("Daily");
  const [expandedGoals, setExpandedGoals] = useState<Record<number, boolean>>({});
  const [menuFor, setMenuFor] = useState<number | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formPeriod, setFormPeriod] = useState<Period>("Morning");
  const [formGoalId, setFormGoalId] = useState<number | null>(null);
  const [formDeadline, setFormDeadline] = useState("");
  const [serverWarning, setServerWarning] = useState(false);

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  function openSheet() {
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setFormTitle("");
    setFormPeriod("Morning");
    setFormGoalId(null);
    setFormDeadline("");
    setServerWarning(false);
  }

  function showGoal(id: number) {
    setTab("Goals");
    setExpandedGoals((s) => ({ ...s, [id]: true }));
  }

  const goJournal = (taskId?: number) =>
    router.push(taskId ? `/journal?taskId=${taskId}` : "/journal");

  const activeByGoal = new Map(goals.map((g) => [g.id, g.activeThisWeek]));
  const showBloat =
    serverWarning ||
    (formGoalId !== null && (activeByGoal.get(formGoalId) ?? 0) >= GOAL_LIMIT);
  const canSubmit = !!formTitle.trim();

  async function submitTask() {
    if (!canSubmit) return;
    const res = await createTask(
      {
        title: formTitle.trim(),
        timeOfDay: formPeriod.toLowerCase(),
        deadline: formDeadline || undefined,
        goalId: formGoalId ?? undefined,
      },
      { force: showBloat },
    );
    if (!res.ok) {
      setServerWarning(true);
      return;
    }
    closeSheet();
    router.refresh();
  }

  const allToday = dailyGroups.flatMap((g) => g.tasks);
  const doneToday = allToday.filter((t) => t.done).length;
  const linkedToday = allToday.filter((t) => t.milestone).length;
  const dayProgress = allToday.length
    ? Math.round((doneToday / allToday.length) * 100)
    : 0;
  const unresolved = allToday.filter(
    (t) =>
      t.missed &&
      !t.done &&
      t.adjustmentStatus !== "accepted" &&
      t.adjustmentStatus !== "auto_applied",
  ).length;

  const groups = tab === "Weekly" ? weeklyGroups : dailyGroups;
  const hasSidebar = goals.length > 0 || unresolved > 0;

  return (
    <div
      className={`flex flex-col items-start gap-[32px] px-[22px] pt-[4px] pb-[96px] min-[900px]:px-[4px] min-[900px]:pb-[48px] ${
        hasSidebar
          ? "min-[900px]:grid min-[900px]:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)]"
          : ""
      }`}
    >
      <div className="flex w-full min-w-0 flex-col gap-[22px]">
        <div className="flex flex-col gap-[12px]">
          <div className="flex flex-wrap items-end justify-between gap-[16px]">
            <div>
              <div className="text-display text-primary font-bold tracking-tight">
                {dateLabel}
              </div>
              <div className="text-body text-text-muted mt-[4px]">
                {doneToday} of {allToday.length} tasks done · {linkedToday}{" "}
                goal-linked
              </div>
            </div>
            {unresolved > 0 && (
              <div className="bg-warning/12 flex items-center gap-[7px] rounded-pill px-[12px] py-[7px] text-[12.5px] font-semibold text-[#9A5B2A]">
                <span className="bg-warning h-[7px] w-[7px] rounded-full" />
                {unresolved === 1
                  ? "1 miss to reflect on"
                  : `${unresolved} misses to reflect on`}
              </div>
            )}
          </div>
          <div className="bg-bg-track h-[6px] overflow-hidden rounded-[4px]">
            <div
              className="bg-primary h-full transition-[width] duration-300"
              style={{ width: `${dayProgress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-[12px]">
          <div className="flex-1">
            <SegmentedControl
              options={["Daily", "Weekly", "Goals"] as const}
              value={tab}
              onChange={setTab}
            />
          </div>
          <button
            type="button"
            onClick={openSheet}
            className="bg-primary text-on-primary hover:bg-primary-hover hidden flex-none rounded-md px-[18px] py-[11px] text-[13.5px] font-semibold min-[900px]:block"
          >
            + Add task
          </button>
        </div>

        {tab !== "Goals" && (
          <div className="flex flex-col gap-[24px]">
            {groups.length === 0 && (
              <p className="text-body text-text-muted">
                {tab === "Daily"
                  ? "Nothing scheduled for today yet."
                  : "Nothing scheduled this week yet."}
              </p>
            )}
            {groups.map((group) => (
              <GroupSection
                key={group.period}
                group={group}
                menuFor={menuFor}
                onToggle={(id) => run(() => toggleTask(id))}
                onMenu={(id) => setMenuFor((m) => (m === id ? null : id))}
                onReschedule={(id) => {
                  setMenuFor(null);
                  run(() => rescheduleTask(id));
                }}
                onUnlink={(id) => {
                  setMenuFor(null);
                  run(() => unlinkTask(id));
                }}
                onPickReason={(id, reason) => run(() => setMissedReason(id, reason))}
                onAccept={(id) => run(() => acceptAdjustment(id))}
                onDecline={(id) => run(() => declineAdjustment(id))}
                onJournal={(task) => goJournal(task.id)}
              />
            ))}
          </div>
        )}

        {tab === "Goals" && (
          <div className="flex flex-col gap-[12px]">
            {goals.length === 0 && (
              <p className="text-body text-text-muted">No goals yet.</p>
            )}
            {goals.map((goal) => (
              <GoalCardView
                key={goal.id}
                goal={goal}
                expanded={!!expandedGoals[goal.id]}
                onExpand={() =>
                  setExpandedGoals((s) => ({ ...s, [goal.id]: !s[goal.id] }))
                }
                onToggleTask={(id) => run(() => toggleTask(id))}
                onJournal={goJournal}
                onAdjust={openSheet}
              />
            ))}
          </div>
        )}
      </div>

      <aside
        className={`sticky top-[24px] hidden flex-col gap-[28px] ${
          hasSidebar ? "min-[900px]:flex" : ""
        }`}
      >
        {goals.length > 0 && (
          <div>
            <SectionLabel className="mb-[12px]">Goals this week</SectionLabel>
            <div className="bg-bg-surface rounded-xl border border-[rgba(29,69,51,0.12)] px-[16px] py-[6px]">
              {goals.map((g, i) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => showGoal(g.id)}
                  className={`flex w-full items-center gap-[12px] py-[12px] text-left ${
                    i < goals.length - 1 ? "border-border-soft border-b" : ""
                  }`}
                >
                  <span className="flex-none text-[17px]">{g.icon}</span>
                  <span className="flex min-w-0 flex-1 flex-col gap-[6px]">
                    <span className="flex items-center justify-between gap-[8px]">
                      <span className="text-body-sm text-text-primary truncate font-semibold">
                        {g.title}
                      </span>
                      <span className="text-text-muted flex-none text-[11.5px]">
                        {g.activeThisWeek}/{GOAL_LIMIT} active
                      </span>
                    </span>
                    <span className="bg-bg-track block h-[5px] overflow-hidden rounded-[3px]">
                      <span
                        className="bg-primary block h-full"
                        style={{ width: `${g.progress}%` }}
                      />
                    </span>
                  </span>
                  <span
                    className={`h-[8px] w-[8px] flex-none rounded-full ${
                      g.drifting ? "bg-warning" : "bg-primary"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
        {unresolved > 0 && (
          <div className="bg-accent flex flex-col gap-[12px] rounded-xl p-[20px]">
            <div className="text-body-lg text-on-primary leading-[1.35] font-semibold">
              A missed task is a signal, not a failure.
            </div>
            <div className="text-on-primary/78 text-[13px] leading-[1.5]">
              Tell us what got in the way and we&apos;ll suggest a smaller next
              step.
            </div>
            <button
              type="button"
              onClick={() => goJournal()}
              className="bg-bg-app text-accent self-start rounded-[9px] px-[14px] py-[9px] text-[12.5px] font-semibold"
            >
              Write a reflection
            </button>
          </div>
        )}
      </aside>

      <button
        type="button"
        onClick={openSheet}
        aria-label="Add task"
        className="bg-primary text-on-primary shadow-fab hover:bg-primary-hover fixed right-[24px] bottom-[24px] z-30 flex h-[54px] w-[54px] items-center justify-center rounded-full text-[24px] min-[900px]:hidden"
      >
        +
      </button>

      <div
        onClick={closeSheet}
        className={`bg-scrim fixed inset-0 z-40 transition-opacity duration-250 ${
          sheetOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        inert={!sheetOpen}
        className={`bg-bg-surface-alt shadow-sheet fixed inset-x-0 bottom-0 z-41 flex max-h-[86vh] flex-col gap-[20px] overflow-y-auto rounded-t-[20px] px-[26px] pt-[26px] pb-[28px] transition-transform duration-[280ms] ease-[cubic-bezier(.4,0,.2,1)] min-[900px]:inset-x-auto min-[900px]:top-0 min-[900px]:right-0 min-[900px]:max-h-none min-[900px]:w-[420px] min-[900px]:max-w-[90vw] min-[900px]:rounded-none ${
          sheetOpen
            ? "translate-y-0 min-[900px]:translate-x-0"
            : "translate-y-full min-[900px]:translate-x-full min-[900px]:translate-y-0"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-primary text-[18px] font-bold">New task</span>
          <button
            type="button"
            onClick={closeSheet}
            aria-label="Close"
            className="bg-bg-track text-accent h-[30px] w-[30px] rounded-full text-[16px]"
          >
            ×
          </button>
        </div>

        <Field label="Task">
          <Input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="e.g. Practice scales"
          />
        </Field>

        <Field label="Time of day">
          <SegmentedControl
            options={["Morning", "Afternoon", "Evening"] as const}
            value={formPeriod}
            onChange={setFormPeriod}
          />
        </Field>

        <Field label="Deadline (optional)">
          <Input
            type="date"
            value={formDeadline}
            onChange={(e) => setFormDeadline(e.target.value)}
          />
        </Field>

        <Field label="Link to a goal (optional)">
          <div className="flex flex-wrap gap-[8px]">
            {[null, ...goals].map((g) => {
              const id = g?.id ?? null;
              const on = formGoalId === id;
              return (
                <button
                  key={id ?? "none"}
                  type="button"
                  onClick={() => {
                    setFormGoalId(id);
                    setServerWarning(false);
                  }}
                  className={`text-label flex items-center gap-[6px] rounded-pill border px-[13px] py-[8px] font-semibold ${
                    on
                      ? "border-accent bg-accent text-on-primary"
                      : "border-border-accent text-accent bg-transparent"
                  }`}
                >
                  {g ? `${g.icon} ${g.title}` : "None"}
                  {g && (
                    <span className="font-medium opacity-70">
                      {g.activeThisWeek}/{GOAL_LIMIT}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {showBloat && (
            <div className="bg-warning/12 rounded-[9px] px-[12px] py-[10px] text-[12.5px] leading-[1.45] text-[#9A5B2A]">
              This goal already has 5 active tasks this week — link anyway?
            </div>
          )}
          <p className="text-text-muted text-[11.5px] leading-[1.45]">
            Goal-linked tasks are milestones. If one slips, we&apos;ll ask why
            and help you adjust.
          </p>
        </Field>

        <Button
          type="button"
          onClick={submitTask}
          disabled={!canSubmit}
          className="mt-auto w-full"
        >
          {showBloat ? "Link anyway" : "Add task"}
        </Button>
      </div>
    </div>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`text-label text-text-muted font-semibold tracking-eyebrow uppercase ${className}`}
    >
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <span className="text-caption text-text-muted font-semibold tracking-[0.05em] uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

function GroupSection({
  group,
  menuFor,
  onToggle,
  onMenu,
  onReschedule,
  onUnlink,
  onPickReason,
  onAccept,
  onDecline,
  onJournal,
}: {
  group: TaskGroup;
  menuFor: number | null;
  onToggle: (id: number) => void;
  onMenu: (id: number) => void;
  onReschedule: (id: number) => void;
  onUnlink: (id: number) => void;
  onPickReason: (id: number, reason: string) => void;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
  onJournal: (task: TodoTask) => void;
}) {
  const done = group.tasks.filter((t) => t.done).length;

  return (
    <div>
      <div className="mb-[10px] flex items-baseline justify-between">
        <SectionLabel>{group.period}</SectionLabel>
        <span className="text-caption text-text-faint">
          {done} of {group.tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-[6px]">
        {group.tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            menuOpen={menuFor === task.id}
            onToggle={() => onToggle(task.id)}
            onMenu={() => onMenu(task.id)}
            onReschedule={() => onReschedule(task.id)}
            onUnlink={() => onUnlink(task.id)}
            onPickReason={(reason) => onPickReason(task.id, reason)}
            onAccept={() => onAccept(task.id)}
            onDecline={() => onDecline(task.id)}
            onJournal={() => onJournal(task)}
          />
        ))}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  menuOpen,
  onToggle,
  onMenu,
  onReschedule,
  onUnlink,
  onPickReason,
  onAccept,
  onDecline,
  onJournal,
}: {
  task: TodoTask;
  menuOpen: boolean;
  onToggle: () => void;
  onMenu: () => void;
  onReschedule: () => void;
  onUnlink: () => void;
  onPickReason: (reason: string) => void;
  onAccept: () => void;
  onDecline: () => void;
  onJournal: () => void;
}) {
  const [otherOpen, setOtherOpen] = useState(false);
  const [otherText, setOtherText] = useState("");

  const { milestone, missed, done } = task;
  const stage = !missed || done ? null : task.adjustmentStatus === "suggested" ? "suggest" : "ask";
  const [suggestion] = task.missedReason
    ? (SUGGESTIONS[task.missedReason] ?? DEFAULT_SUGGESTION)
    : ["", ""];

  const checkSize = milestone ? "h-[21px] w-[21px]" : "h-[18px] w-[18px]";
  const checkState = done
    ? "border-primary bg-primary"
    : missed
      ? "border-warning bg-warning/12"
      : "border-[rgba(29,69,51,0.3)] bg-transparent";

  return (
    <div
      className={`rounded-lg border transition-colors ${
        milestone
          ? `bg-bg-surface px-[14px] py-[13px] ${
              missed && !done
                ? "border-warning/35"
                : "border-[rgba(29,69,51,0.12)]"
            }`
          : "border-transparent bg-transparent px-[14px] py-[8px]"
      }`}
    >
      <div className="flex items-center gap-[12px]">
        <button
          type="button"
          onClick={onToggle}
          title={done ? "Mark as not done" : "Mark as done"}
          className={`text-bg-surface flex flex-none items-center justify-center rounded-[6px] border-[1.6px] p-0 text-[12px] leading-none ${checkSize} ${checkState}`}
        >
          {done ? "✓" : ""}
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <div
            className={`text-pretty ${
              milestone ? "text-[14.5px] font-medium" : "text-body-sm font-normal"
            } ${
              done
                ? "text-[#A3968A] line-through"
                : milestone
                  ? "text-text-primary"
                  : "text-ink-500"
            }`}
          >
            {task.title}
          </div>
          {(missed || task.deadlineLabel) && !done && (
            <div className="text-text-muted flex flex-wrap items-center gap-[8px] text-[11.5px]">
              {missed && (
                <span className="font-semibold text-[#9A5B2A]">Missed</span>
              )}
              {task.deadlineLabel && <span>Due {task.deadlineLabel}</span>}
            </div>
          )}
        </div>
        {task.goalLabel && (
          <div className="bg-bg-tag text-accent flex flex-none items-center gap-[5px] rounded-pill px-[10px] py-[4px] text-[11.5px] font-semibold whitespace-nowrap">
            {task.goalLabel}
          </div>
        )}
        <button
          type="button"
          onClick={onMenu}
          title="More actions"
          className={`text-text-muted hover:bg-bg-tab-track h-[28px] w-[28px] flex-none rounded-[8px] p-0 text-[15px] tracking-[1px] ${
            menuOpen ? "bg-bg-tab-track" : "bg-transparent"
          }`}
        >
          ···
        </button>
      </div>

      {menuOpen && (
        <div className="mt-[10px] flex flex-wrap gap-[6px] pl-[33px]">
          <MenuAction onClick={onReschedule}>Move to tomorrow</MenuAction>
          {milestone && (
            <MenuAction onClick={onUnlink}>Unlink from goal</MenuAction>
          )}
        </div>
      )}

      {stage === "ask" && (
        <LoopPanel>
          <div className="text-accent text-[13px] font-semibold">
            What got in the way?
          </div>
          <div className="flex flex-wrap gap-[6px]">
            {REASONS.map((r) => (
              <ReasonChip key={r} onClick={() => onPickReason(r)}>
                {r}
              </ReasonChip>
            ))}
            <ReasonChip active={otherOpen} onClick={() => setOtherOpen((o) => !o)}>
              Something else
            </ReasonChip>
          </div>
          {otherOpen && (
            <div className="flex gap-[8px]">
              <input
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="In a few words…"
                className="border-border-accent bg-bg-surface text-text-primary min-w-0 flex-1 rounded-[9px] border px-[12px] py-[9px] text-[13px] outline-none"
              />
              <button
                type="button"
                onClick={() => otherText.trim() && onPickReason(otherText.trim())}
                className="bg-accent text-on-primary flex-none rounded-[9px] px-[14px] text-caption font-semibold"
              >
                Save
              </button>
            </div>
          )}
          <div className="text-text-faint text-[11.5px]">
            No pressure — skipping this is fine.
          </div>
        </LoopPanel>
      )}

      {stage === "suggest" && (
        <LoopPanel>
          <div className="flex flex-wrap items-center gap-[8px]">
            <span className="text-text-muted text-[11.5px]">Reason</span>
            <span className="bg-accent text-on-primary rounded-pill px-[10px] py-[4px] text-[11.5px] font-semibold">
              {task.missedReason}
            </span>
          </div>
          <div className="flex flex-col gap-[10px] rounded-md bg-[#F7EFE3] px-[14px] py-[12px]">
            <div className="text-accent text-[13px] leading-[1.45] text-pretty">
              {suggestion}
            </div>
            <div className="flex flex-wrap items-center gap-[8px]">
              <button
                type="button"
                onClick={onAccept}
                className="bg-primary text-on-primary hover:bg-primary-hover rounded-[8px] px-[14px] py-[7px] text-caption font-semibold"
              >
                Adjust
              </button>
              <button
                type="button"
                onClick={onDecline}
                className="text-accent rounded-[8px] border border-[rgba(94,49,34,0.3)] bg-transparent px-[14px] py-[7px] text-caption font-semibold"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={onJournal}
                className="text-accent ml-auto px-[4px] py-[7px] text-caption font-semibold underline underline-offset-[3px]"
              >
                Reflect in Journal →
              </button>
            </div>
          </div>
        </LoopPanel>
      )}
    </div>
  );
}

function LoopPanel({ children }: { children: ReactNode }) {
  return (
    <div className="mt-[12px] flex flex-col gap-[10px] border-t border-dashed border-[rgba(94,49,34,0.2)] pt-[12px]">
      {children}
    </div>
  );
}

function ReasonChip({
  active = false,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-accent hover:border-accent rounded-pill border px-[12px] py-[6px] text-caption font-medium ${
        active ? "border-accent bg-bg-tag" : "border-border-accent bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}

function MenuAction({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border-strong bg-bg-surface text-text-body hover:bg-bg-tab-track rounded-[8px] border px-[11px] py-[6px] text-caption font-semibold"
    >
      {children}
    </button>
  );
}

function GoalCardView({
  goal,
  expanded,
  onExpand,
  onToggleTask,
  onJournal,
  onAdjust,
}: {
  goal: GoalCard;
  expanded: boolean;
  onExpand: () => void;
  onToggleTask: (id: number) => void;
  onJournal: () => void;
  onAdjust: () => void;
}) {
  const doneCount = goal.tasks.filter((t) => t.done).length;
  const streak = goal.drifting
    ? `${goal.missesThisWeek} misses this week`
    : goal.missesThisWeek === 1
      ? "1 miss this week"
      : "On pace";

  return (
    <div className="bg-bg-surface rounded-xl border border-[rgba(29,69,51,0.12)] p-[18px]">
      <button
        type="button"
        onClick={onExpand}
        className="flex w-full flex-col gap-[12px] text-left"
      >
        <span className="flex w-full items-center gap-[12px]">
          <span className="bg-bg-tab-track flex h-[40px] w-[40px] flex-none items-center justify-center rounded-[11px] text-[20px]">
            {goal.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-text-primary block text-[15.5px] font-semibold">
              {goal.title}
            </span>
            <span className="text-caption text-text-muted mt-[2px] block">
              {goal.horizon} · {doneCount} of {goal.tasks.length} tasks done
            </span>
          </span>
          <span
            className={`flex flex-none items-center gap-[6px] rounded-pill px-[10px] py-[5px] text-[11.5px] font-semibold ${
              goal.drifting
                ? "bg-warning/12 text-[#9A5B2A]"
                : "bg-primary/8 text-primary"
            }`}
          >
            <span
              className={`h-[7px] w-[7px] rounded-full ${
                goal.drifting ? "bg-warning" : "bg-primary"
              }`}
            />
            {goal.drifting ? "Drifting" : "On track"}
          </span>
          <span
            className={`text-text-faint w-[12px] flex-none text-center text-[16px] transition-transform duration-200 ${
              expanded ? "rotate-90" : "rotate-0"
            }`}
          >
            ›
          </span>
        </span>
        <span className="flex w-full items-center gap-[12px]">
          <span className="bg-bg-track block h-[7px] flex-1 overflow-hidden rounded-[4px]">
            <span
              className="bg-primary block h-full rounded-[4px]"
              style={{ width: `${goal.progress}%` }}
            />
          </span>
          <span className="text-primary w-[38px] flex-none text-right text-[13px] font-semibold">
            {goal.progress}%
          </span>
        </span>
        <span className="text-caption text-text-muted">{streak}</span>
      </button>

      {expanded && (
        <div className="border-border-soft mt-[14px] flex flex-col gap-[9px] border-t pt-[14px]">
          {goal.tasks.length === 0 && (
            <p className="text-body-sm text-text-faint">No tasks linked yet.</p>
          )}
          {goal.tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-[10px]">
              <button
                type="button"
                onClick={() => onToggleTask(t.id)}
                className={`text-bg-surface flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[5px] border-[1.5px] p-0 text-[10px] ${
                  t.done
                    ? "border-primary bg-primary"
                    : "border-[rgba(29,69,51,0.3)] bg-transparent"
                }`}
              >
                {t.done ? "✓" : ""}
              </button>
              <span
                className={`text-body-sm ${
                  t.done ? "text-[#A3968A] line-through" : "text-text-primary"
                }`}
              >
                {t.title}
              </span>
            </div>
          ))}
          {goal.drifting && (
            <div className="mt-[6px] flex flex-col gap-[8px] rounded-md bg-[#F7EFE3] px-[14px] py-[12px]">
              <div className="text-accent text-[12.5px] leading-[1.45]">
                You&apos;ve missed{" "}
                <strong>{goal.missesThisWeek} milestone tasks</strong> this
                week.
              </div>
              <div className="flex flex-wrap gap-[8px]">
                <button
                  type="button"
                  onClick={onJournal}
                  className="text-accent rounded-[8px] border border-[rgba(94,49,34,0.3)] bg-transparent px-[12px] py-[7px] text-caption font-semibold"
                >
                  Review reflections
                </button>
                <button
                  type="button"
                  onClick={onAdjust}
                  className="bg-primary text-on-primary rounded-[8px] px-[12px] py-[7px] text-caption font-semibold"
                >
                  Adjust upcoming tasks
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
