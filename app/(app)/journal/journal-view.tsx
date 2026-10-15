"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { createEntry } from "./actions";
import type { InboundContext, JournalEntryView } from "./view-model";

type Filter = "All" | "Linked to Goals" | "Free entries";

const MOODS = [
  { label: "Good", emoji: "😊" },
  { label: "Neutral", emoji: "😐" },
  { label: "Low", emoji: "😔" },
  { label: "Frustrated", emoji: "😤" },
  { label: "Tired", emoji: "😴" },
];

export function JournalView({
  entries,
  inboundContext,
}: {
  entries: JournalEntryView[];
  inboundContext: InboundContext | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [filter, setFilter] = useState<Filter>("All");
  const [sheetOpen, setSheetOpen] = useState(!!inboundContext);
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<string | null>(null);

  function closeSheet() {
    setSheetOpen(false);
    setBody("");
    setMood(null);
  }

  function submitEntry() {
    const trimmed = body.trim();
    if (!trimmed) return;

    const title = inboundContext?.taskTitle ?? trimmed.slice(0, 60);

    startTransition(async () => {
      await createEntry({
        title,
        journalDescription: trimmed,
        moodTag: mood ?? undefined,
        taskId: inboundContext?.taskId,
        goalId: inboundContext?.goalId ?? undefined,
      });
      closeSheet();
      // Also strips ?taskId= so a reload doesn't re-prefill a stale context.
      router.replace("/journal");
      router.refresh();
    });
  }

  const filtered = entries.filter((e) => {
    if (filter === "Linked to Goals") return e.isGoalLinked;
    if (filter === "Free entries") return !e.isGoalLinked;
    return true;
  });

  return (
    <div className="flex flex-col items-start gap-[22px] px-[22px] pt-[4px] pb-[96px] min-[900px]:px-[4px] min-[900px]:pb-[48px]">
      <div className="w-full">
        <SegmentedControl
          options={["All", "Linked to Goals", "Free entries"] as const}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-body text-text-muted">
          {entries.length === 0 ? "No reflections yet." : "No entries match this filter."}
        </p>
      ) : (
        <div className="flex w-full flex-col gap-[12px]">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="bg-bg-surface flex flex-col gap-[8px] rounded-xl border border-[rgba(29,69,51,0.12)] p-[16px]"
            >
              <div className="flex items-center justify-between gap-[10px]">
                <span className="text-text-primary text-[14.5px] font-semibold">
                  {entry.title}
                </span>
                <span className="text-caption text-text-faint flex-none">
                  {entry.dateLabel}
                </span>
              </div>
              {entry.linkLabel && (
                <span className="bg-bg-tag text-accent inline-flex w-fit items-center rounded-pill px-[10px] py-[4px] text-[11.5px] font-semibold">
                  {entry.linkLabel}
                </span>
              )}
              <p className="text-body-sm text-text-body leading-relaxed">{entry.body}</p>
              {entry.moodTag && (
                <span className="text-caption text-text-muted">{entry.moodTag}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-label="New entry"
        className="bg-primary text-on-primary shadow-fab hover:bg-primary-hover fixed right-[24px] bottom-[24px] z-30 flex h-[54px] w-[54px] items-center justify-center rounded-full text-[24px]"
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
          <span className="text-primary text-[18px] font-bold">New entry</span>
          <button
            type="button"
            onClick={closeSheet}
            aria-label="Close"
            className="bg-bg-track text-accent h-[30px] w-[30px] rounded-full text-[16px]"
          >
            ×
          </button>
        </div>

        {inboundContext && (
          <div className="bg-bg-tag text-accent flex flex-col gap-[2px] rounded-[10px] px-[12px] py-[9px] text-[12.5px]">
            <span className="font-semibold">
              {inboundContext.goalLabel ?? inboundContext.taskTitle}
            </span>
            {inboundContext.goalLabel && <span>{inboundContext.taskTitle}</span>}
            {inboundContext.reason && <span>Missed: {inboundContext.reason}</span>}
          </div>
        )}

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's on your mind?"
          rows={6}
          className="text-body border-border-strong bg-bg-surface text-text-primary placeholder:text-text-faint focus:border-primary w-full resize-none rounded-md border px-[14px] py-3 outline-none"
        />

        <div className="flex flex-col gap-[6px]">
          <span className="text-caption text-text-muted font-semibold tracking-[0.05em] uppercase">
            Mood (optional)
          </span>
          <div className="flex flex-wrap gap-[8px]">
            {MOODS.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => setMood((cur) => (cur === m.label ? null : m.label))}
                className={`text-label flex items-center gap-[6px] rounded-pill border px-[12px] py-[7px] font-semibold ${
                  mood === m.label
                    ? "border-accent bg-accent text-on-primary"
                    : "border-border-accent text-accent bg-transparent"
                }`}
              >
                <span>{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          onClick={submitEntry}
          disabled={!body.trim()}
          className="mt-auto w-full"
        >
          Save entry
        </Button>
      </div>
    </div>
  );
}
