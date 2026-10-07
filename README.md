# Wellness Hub

Wellness Hub is a web app that helps you stay aligned with your long-term goals by surfacing _why_ you drift from them so you can course-correct.

## Modules

### ToDo List

The core module, built around two complementary focuses:

- **Daily Tasks** — short-term, actionable items tied to your everyday routine.
- **Goals (Monthly/Yearly)** — longer-term objectives that daily and weekly tasks ladder up to.

A Daily Task can be an **orphan** (no goal attached) or a **milestone** (linked to a goal). Only milestone tasks matter to the app's core differentiator: it tracks _deviation_, not just completion.

**Failure Feedback Loop** — when a milestone task isn't completed, you're prompted with a short "Why couldn't you complete this?" This feeds:

1. **Daily Adjustment** — a suggested change to realign with the goal (reduce scope, reschedule, break into smaller steps). Ignoring the prompt counts the same as declining it; after 3 missed+declined cycles on the same task, the app auto-applies its last suggestion.
2. **Journal Linking** — the failure reason can be linked to a Journal entry for deeper reflection on recurring patterns. Only this live, in-the-moment flow shows the adjustment suggestion — linking a journal entry retroactively is pure reflection, with no adjustment CTA.

This closes the loop: **Goal -> Task -> Failure -> Reflection -> Adjustment**.

Goal-linking has a soft limit too: at most 5 active tasks per goal per week, to discourage linking everything to a goal just for visual prominence (warned inline, not hard-blocked).

### Journaling

The reflective counterpart to the ToDo List — a calm, distraction-free writing surface for making sense of _why_ things happened.

- Entries can be linked to ToDo tasks/goals, either automatically (from a failed milestone task) or manually.
- Linked entries show up as timeline markers on the corresponding Goal Card.
- **Review Mode** groups entries by linked goal, so you can spot recurring patterns of drift over time.

### Dashboard / Home

The entry point of the app, answering: _"Am I still moving toward my goals, or have I drifted?"_

- **Goals Overview** — scrollable Goal Cards with progress % and a **drift indicator**: 🟠 drifting means 2+ missed milestone tasks in the last 7 days with at least one still unresolved (no adjustment accepted/applied); otherwise 🟢 on track.
- **Recent Activity** — a merged feed of completions, misses, and journal entries.
- **Mood/consistency mini-chart** — two side-by-side sparklines (completion rate, mood tags), presented descriptively with no auto-generated "insight" copy — a mirror, not a diagnosis.

## Design

- **Navigation**: left-side hamburger menu with `ToDo`, `Journaling`, and `Home`.
- **Modes**: supports Dark and Light mode.
- **Palette**:
  - Primary (light mode) — soft green `#1D4533`
  - Background/surface (light mode) — `#F7EAE0`
  - Accent (dark mode) — `#5E3122`
- Misses are shown with a soft orange/amber marker rather than red, keeping the tone supportive rather than punitive.

See [`project.md`](./project.md) for the full product spec, including UI details per module and the system architecture.

## Tech Stack

- [Next.js](https://nextjs.org) 16
- React 19
- TypeScript
- Tailwind CSS 4

**Layout:** Server Actions per module (`app/<module>/actions.ts`) → Zod validation (`lib/validations/`) → business rules (`lib/services/`) → Drizzle (`lib/db/`). See `project.md` → Architecture for details.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.
