# ToDo List

## Overview

The ToDo List is one of the core modules of the Wellness Hub, built around two complementary focuses:

- **Daily Tasks** — short-term, actionable items tied to the user's everyday routine.
- **Annual / Monthly Tasks (Goals)** — longer-term objectives that daily and weekly tasks should ladder up to.

The key differentiator of this ToDo List is that it doesn't just track completion — it tracks _deviation_. Every task can be linked to a higher-level goal (Monthly or Yearly), and when a user fails to complete a task tied to that goal, the app treats it as a signal rather than a simple miss.

## Failure Feedback Loop

When a task linked to a goal is not completed, the user is prompted to answer a short "Why couldn't you complete this?" input. This reason then feeds two things:

1. **Daily Adjustment** — based on the reason given, the app suggests an adjustment to the user's daily tasks (e.g., reducing scope, rescheduling, breaking the task into smaller steps) to help realign with the original goal without abandoning it.
   - **Decline/ignore handling:** not responding to the prompt by end of day counts the same as an explicit decline — the app never forces a response, since that would contradict the non-punitive tone.
   - **Auto-adjustment after 3 cycles:** after the 3rd missed-and-declined cycle on the same task, the app auto-applies whatever adjustment it last suggested (it commits to its own last offer rather than escalating to something new or more aggressive).
   - An unresolved decline/ignore loop (no adjustment ever accepted or auto-applied) is itself a drift signal — see Drift Indicator below.
2. **Journal Linking** — the failure reason can be linked to an entry in the Journaling module, so the user can reflect more deeply on recurring patterns of failure and connect emotional/contextual notes to specific missed tasks.
   - This adjustment-suggestion CTA only fires from this **live** failure-prompt flow (task still today/upcoming). It does not apply to entries linked retroactively — see Journaling → Linking Flow.

This creates a closed loop between **Goal → Task → Failure → Reflection → Adjustment**, keeping the user inside their intended "life flow" instead of just accumulating unchecked boxes.

## Task Structure

- **Daily Task**: atomic, checkable, optionally recurring, can optionally reference a parent goal.
- **Monthly/Yearly Goal**: broader objective, made up of nested tasks (weekly/daily) that contribute progress toward it.
- **Relationship**: a Daily Task can be an "orphan" (no goal attached) or a "milestone" (attached to a Monthly/Yearly Goal). Only milestone tasks trigger the failure-reason flow.
- **Goal-bloat prevention** ([Issue #22](https://github.com/jnx257/wellnesshub/issues/22)): at most 5 active (incomplete) milestone tasks per goal per week. This is enforced as a **soft warning, not a hard block** — when linking a 6th active task to the same goal in the same week, the UI shows an inline confirm ("This goal already has 5 active tasks this week — link anyway?") rather than refusing the action outright. A hard block would create friction for legitimate edge cases (e.g. an urgent task that genuinely belongs to the goal); the point is to discourage reflexive linking, not to disallow it.
- **Goal progress %** (MVP): `completed / total linked milestone tasks`, unweighted. This is a known simplification — a goal can show 75% complete while its single hardest/most-critical task is the one still incomplete. Weighting by task importance would require an importance field that doesn't exist yet; revisit if this proves misleading in practice.

## UI

- A left-side hamburger menu with the options: **ToDo**, **Journaling**, and **Home** (the dashboard).
- The ToDo screen has a toggle/segmented control to switch between **Daily view** and **Goals view (Monthly/Yearly)**.
  - **Daily view**: checklist-style list, grouped by time of day or priority.
  - **Goals view**: goal cards showing progress (e.g., % complete based on linked sub-tasks), with nested/collapsible daily or weekly tasks underneath each goal.
- When a milestone task is marked as failed/incomplete, a modal or inline input appears asking for the failure reason, with an optional shortcut to link it to a Journal entry.
- Supports **Dark** and **Light** mode.
  - Light mode: primary color soft green `#1D4533`, background/surface `#F7EAE0`.
  - Dark mode: secondary color `#5E3122` (dark mode surface/palette still to be defined).

### ToDo UI

The ToDo UI is structured around the app's core objective: keeping the user aligned with their long-term goals, and surfacing _why_ they drift so they can course-correct — not just tracking checkboxes.

**Layout**

- A segmented control at the top switches between two focuses:
  - **Daily** — today's actionable tasks.
  - **Goals** — Monthly/Yearly objectives and their nested tasks.
- A left-side hamburger menu (global nav) gives access to `ToDo`, `Journaling`, and `Home`.

**Daily View**

- Simple checklist grouped by time of day or priority (Morning / Afternoon / Evening, or High/Medium/Low).
- Each task item shows:
  - Checkbox / completion state.
  - Task title.
  - A small **goal tag/pill** (e.g., 🎵 "Piano") if the task is a _milestone task_ linked to a Monthly/Yearly Goal. Orphan tasks (no goal) have no tag, visually lighter/less emphasized than milestone tasks — reinforcing that goal-linked tasks matter more to the app's purpose.
- Swipe or long-press on a task reveals quick actions: complete, reschedule, edit, unlink from goal.

**Goals View**

- List of **Goal Cards** (Monthly/Yearly), each showing:
  - Goal title and category icon (e.g., 🎹, 🏃, 📚).
  - Progress bar / % complete, calculated from linked sub-tasks.
  - A small streak or consistency indicator (e.g., "3 weeks on track", "2 misses this month").
- Tapping a Goal Card expands it into a nested list of its Weekly/Daily tasks (collapsible tree), so the user always sees how today's tasks ladder up to the bigger objective.

**Failure Feedback Flow (core differentiator)**

- When a _milestone task_ (linked to a goal) is missed or marked incomplete at day's end, the app doesn't just silently fail it — it triggers a lightweight, non-punitive prompt:
  - **Modal/bottom-sheet**: "Couldn't complete '[Task]' — what got in the way?"
  - Quick-select common reasons (e.g., "No time", "Too tired", "Lost motivation", "Unexpected event") + free-text option.
  - Optional CTA: "Link this to a Journal entry" — jumps into Journaling with the task/reason pre-filled as context.
- Based on the reason selected, the app surfaces a **suggested adjustment** inline (e.g., "Want to reduce tomorrow's practice to 1h instead of skipping it?" or "Move this task to the weekend?").
- This turns a missed task from a dead-end failure into an active redirection back toward the goal — visually distinct from a simple "strikethrough" completed/failed state (e.g., a soft orange/amber marker instead of red, to keep tone supportive rather than punitive).

**Visual tone**

- Uses the app's soft green (`#1D4533`) for completed/on-track states, and a warm terracotta/brown (`#5E3122`) as an accent for goal tags and streak indicators — avoiding harsh red for misses to keep the emotional tone aligned with wellness rather than guilt.

### Journaling UI

The Journaling UI serves as the reflective counterpart to the ToDo List — the space where the user makes sense of _why_ things happened, not just _what_ happened. Its main differentiator is the ability to link entries to specific ToDo tasks (especially failed milestone tasks), turning journaling into a diagnostic tool rather than a disconnected diary.

**Layout**

- A simple, distraction-free writing surface (minimal chrome, generous whitespace) — journaling should feel calm, not like another task to complete.
- Entries are organized in a reverse-chronological feed, with optional filters: `All`, `Linked to Goals`, `Free entries`.
- A floating action button (`+`) starts a new entry.

**Entry Structure**

- Each entry has:
  - Date/time stamp (auto).
  - Optional mood/emotion tag (small icon or color dot — reused visually across the app, e.g., in the Dashboard).
  - Free-text body.
  - Optional **linked task/goal chip** at the top of the entry (e.g., 🎹 "Practice Fur Elise — missed"), shown when the entry originated from, or was manually linked to, a ToDo item.

**Linking Flow (core differentiator)**

- Entries can be linked to ToDo items in two ways:
  1. **Inbound from ToDo**: when a milestone task fails, the user can jump straight into a new Journal entry with the task and failure-reason pre-filled as context (from the ToDo failure flow). This is the only path that shows the **adjustment-suggestion CTA**, since the task is still live/actionable (today or upcoming).
  2. **Manual linking**: from within an entry, the user can search and attach any existing task or goal (e.g., writing a reflection first, then realizing it relates to "Learning Piano"). This path is retroactive and **never** surfaces an adjustment suggestion — the task is already past, so there's nothing left to adjust. It still counts fully toward timeline markers and Review Mode.
- Linked entries appear as a small timeline marker on the corresponding **Goal Card** in the Goals View, so the user can see, at a glance, which goals have accumulated reflection over time and which haven't.

**Review Mode**

- A secondary view (accessible via filter or tab) groups entries **by linked goal**, letting the user scroll through all reflections tied to a single objective — e.g., every entry connected to "Learning Piano" — to spot recurring patterns in why they drift from it.

**Visual tone**

- Uses a softer, more neutral palette than the ToDo UI (background surface `#F7EAE0` in light mode, with muted text) to signal a shift from "action mode" to "reflection mode." The primary green (`#1D4533`) is reserved for linked/goal-tagged entries, keeping visual continuity with the ToDo module.

### Dashboard/Home UI

The Dashboard is the entry point of the app — a synthesized view of the ToDo List and Journaling data, designed to answer one question at a glance: _"Am I still moving toward my goals, or have I drifted?"_

**Layout**

- Top section: a **greeting + daily snapshot** (e.g., "Good morning, [Name]" + count of today's tasks, how many are goal-linked).
- Middle section: **Goals Overview** — horizontally scrollable Goal Cards (same component as in Goals View), each showing progress % and a small "drift indicator."
- Bottom section: **Recent Activity feed** — a merged, chronological feed of recent completions, misses, and journal entries, so the user sees ToDo and Journaling activity side by side rather than in silos.

**Drift Indicator (core differentiator)**

- Each Goal Card on the Dashboard includes a compact visual signal — not just progress %, but _trend_:
  - 🟢 **On track**: fewer than 2 missed milestone tasks in the trailing 7 days, or any misses already have a resolved feedback loop.
  - 🟠 **Drifting**: ≥2 missed milestone tasks in the trailing 7 days **and** at least one of those misses has no resolved feedback loop (no adjustment accepted or auto-applied). A single miss that the user already closed the loop on stays green — the rule rewards resolving drift, not just avoiding misses.
  - Tapping a drifting goal surfaces a short summary: most common failure reasons logged that month, and a shortcut to review related Journal entries or adjust upcoming tasks.
- This makes the Dashboard function as an early-warning system, surfacing _patterns_ (not just missed days) before the user falls too far out of their intended flow.

**Secondary Widgets**

- **Mood/consistency mini-chart**: two side-by-side sparklines (7-day or 30-day) — one for task completion rate, one for journal mood tags — labeled simply "Your week." Deliberately **not** rendered as a single overlaid "correlation" line, and with no auto-generated insight copy (e.g. no "you complete more when happy") or correlation coefficient. It's meant to be a mirror the user can read into themselves, not a diagnosis the app hands them — correlation ≠ causation, and prescriptive framing here would undercut the supportive tone.
- **Quick actions**: shortcuts to "Add Daily Task," "New Journal Entry," and "Review a Drifting Goal."

**Visual tone**

- Acts as the visual anchor for the whole app's palette: primary green (`#1D4533`) for on-track states, terracotta/brown (`#5E3122`) for goal accents and drift warnings (instead of red, keeping the supportive/non-punitive tone established in the ToDo UI), and the light background surface (`#F7EAE0`) unifying the dashboard with the rest of the Hub.

## Tech Stack Decisions

- **Database: Neon (Postgres serverless).** Chosen over Supabase (bundles auth/storage we don't need yet), Turso/SQLite (fewer relational features to learn on), and self-hosted Postgres (infra overhead not worth it for a solo project deploying to Vercel). Neon gives real Postgres with no vendor lock-in and integrates well with Vercel.
- **ORM: Drizzle.** Chosen over Prisma (heavier runtime, historically worse cold starts in serverless) and Kysely (more manual, no declarative schema). Drizzle is SQL-first, type-safe end to end, and keeps migrations simple via `drizzle-kit`.

## Architecture

**Folder layout**

- `app/<module>/page.tsx` + `app/<module>/actions.ts` — each module gets a route with colocated Next.js Server Actions (e.g. `app/todo/`, `app/journal/`).
- `lib/db/index.ts` — the Drizzle client (`neon-http` driver), exported as `db`.
- `lib/db/schemas/` — Drizzle table definitions, one file per entity (`goal.ts`, `task.ts`, `journal-entry.ts`), re-exported together via `schemas/index.ts`.
- `lib/validations/` — Zod schemas per entity, used to parse untrusted input at the start of a Server Action (e.g. `createTaskSchema` in `validations/task.ts`).
- `lib/services/` — business-rule helpers that Server Actions call into, kept separate from both the DB layer and the action layer so rules like the goal-bloat limit have one home (`services/task.ts`: `getTaskCounter`, `validateTaskLimit`, `getWeekStart`).

**Request flow**

```
UI → Server Action ("use server") → Zod validation → service-layer rule check → Drizzle query/mutation → return to UI
```

The goal-bloat rule described above (max 5 active tasks/week/goal) is implemented exactly this way: `createTask` in `app/todo/actions.ts` parses input with `createTaskSchema`, then calls `validateTaskLimit` from `lib/services/task.ts` before inserting.

**Known gaps (as of this writing)**

- `lib/db/schemas/journal-entry.ts` and `lib/validations/journal-entry.ts`/`goal.ts` are stubs — the Journaling and Goal modules don't yet have a validated create/update flow the way `task.ts` does. Treat the Journaling/Goal UI specs above as design targets, not shipped behavior.
