# ToDo List

## Overview

The ToDo List is one of the core modules of the Wellness Hub, built around two complementary focuses:

- **Daily Tasks** — short-term, actionable items tied to the user's everyday routine.
- **Annual / Monthly Tasks (Goals)** — longer-term objectives that daily and weekly tasks should ladder up to.

The key differentiator of this ToDo List is that it doesn't just track completion — it tracks _deviation_. Every task can be linked to a higher-level goal (Monthly or Yearly), and when a user fails to complete a task tied to that goal, the app treats it as a signal rather than a simple miss.

## Failure Feedback Loop

When a task linked to a goal is not completed, the user is prompted to answer a short "Why couldn't you complete this?" input. This reason then feeds two things:

1. **Daily Adjustment** — based on the reason given, the app suggests an adjustment to the user's daily tasks (e.g., reducing scope, rescheduling, breaking the task into smaller steps) to help realign with the original goal without abandoning it. When adjustment is declined by the user, when has a three time failure the task in adjusted automatically.
2. **Journal Linking** — the failure reason can be linked to an entry in the Journaling module, so the user can reflect more deeply on recurring patterns of failure and connect emotional/contextual notes to specific missed tasks.

This creates a closed loop between **Goal → Task → Failure → Reflection → Adjustment**, keeping the user inside their intended "life flow" instead of just accumulating unchecked boxes.

## Task Structure

- **Daily Task**: atomic, checkable, optionally recurring, can optionally reference a parent goal.
- **Monthly/Yearly Goal**: broader objective, made up of nested tasks (weekly/daily) that contribute progress toward it.
- **Relationship**: a Daily Task can be an "orphan" (no goal attached) or a "milestone" (attached to a Monthly/Yearly Goal). Only milestone tasks trigger the failure-reason flow.

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
  1. **Inbound from ToDo**: when a milestone task fails, the user can jump straight into a new Journal entry with the task and failure-reason pre-filled as context (from the ToDo failure flow).
  2. **Manual linking**: from within an entry, the user can search and attach any existing task or goal (e.g., writing a reflection first, then realizing it relates to "Learning Piano").
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
  - 🟢 **On track**: consistent completion, few/no recent misses.
  - 🟠 **Drifting**: recent misses on milestone tasks, especially ones without a completed feedback/adjustment loop (i.e., failure reason given, but no follow-up action taken).
  - Tapping a drifting goal surfaces a short summary: most common failure reasons logged that month, and a shortcut to review related Journal entries or adjust upcoming tasks.
- This makes the Dashboard function as an early-warning system, surfacing _patterns_ (not just missed days) before the user falls too far out of their intended flow.

**Secondary Widgets**

- **Mood/consistency mini-chart**: a lightweight visualization (e.g., 7-day or 30-day strip) combining task completion rate and journal mood tags, to correlate emotional state with goal progress over time.
- **Quick actions**: shortcuts to "Add Daily Task," "New Journal Entry," and "Review a Drifting Goal."

**Visual tone**

- Acts as the visual anchor for the whole app's palette: primary green (`#1D4533`) for on-track states, terracotta/brown (`#5E3122`) for goal accents and drift warnings (instead of red, keeping the supportive/non-punitive tone established in the ToDo UI), and the light background surface (`#F7EAE0`) unifying the dashboard with the rest of the Hub.

# Thinks to think later:

1. On the "Failure Feedback Loop": You mention the app suggests adjustments (e.g., "reduce tomorrow's practice to 1h"), but who decides whether to accept or reject that suggestion? Is there a friction cost if the user ignores the suggestion? Could that create a secondary failure loop where users dismiss adjustments and then miss the task again?
2. Milestone vs. Orphan asymmetry: You say orphan tasks are "visually lighter/less emphasized" to signal they matter less. But won't this design pressure users to link everything to a goal, even low-stakes tasks, just to get visual parity? How do you prevent goal bloat?
3. The "drift indicator" on the Dashboard: You mention it surfaces patterns of missses, but what's the minimum data needed to trigger a "drifting" signal? One miss? Two? A percentage? If the threshold is too sensitive, does it become noise; if too high, does it miss early warning signs?
4. Journaling linking in both directions: Entries can be linked from ToDo failures or manually linked later. But if a user writes a journal entry first and links it retroactively, they've already done the reflection — is there still value in the app suggesting an "adjustment" to a task that's already past?
5. The mood/consistency mini-chart: You say it correlates mood tags with task completion, but correlation isn't causation. If mood and completion are uncorrelated, does the chart just become noise? How do you prevent it from being misinterpreted as "be happier to complete tasks"?
6. Progress % calculation: For a Goal with nested tasks, how is progress calculated? Is it just "tasks completed / total tasks"? What if a user completes 3 easy tasks but misses 1 critical one—should they feel 75% done?
