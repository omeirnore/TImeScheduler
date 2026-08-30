# TimeScheduler

A single-user personal productivity & time intelligence dashboard: college
timetable, commute/rest buffers, study planning, habit auto-scheduling, and
daily task tracking, all on one clean daily view.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite (via the `@prisma/adapter-better-sqlite3` driver adapter)
- Single-user auth: bcrypt password hash + signed JWT session cookie (no
  third-party auth service)
- Vitest for the scheduling engine's unit tests

## Getting started

```bash
npm install
cp .env.example .env      # then edit AUTH_SECRET to a random value
npx prisma migrate deploy
npm run dev
```

Open http://localhost:3000. The first visit walks you through one-time
account setup (this app supports exactly one user).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm start` — production build and run
- `npm test` — run the scheduling engine's unit tests
- `npm run db:migrate` — create/apply a Prisma migration
- `npm run lint` — ESLint

## Architecture notes

- **Scheduling engine** (`src/lib/scheduling/engine.ts`) is a pure,
  dependency-free function: given a day's timetable, commute config, study
  plan, and habits, it produces a conflict-free timeline via greedy interval
  packing (college/commute/rest and locked habits are placed as fixed
  anchors, then study blocks, then floating habits by priority, then
  leftover free time). It has no I/O and is covered by its own test suite.
- **Day data is never persisted as a generated schedule.** Only the
  underlying inputs (timetable, commute config, study plan, habits, and
  per-date skips/overrides) are stored; the day's timeline is recomputed on
  each view via `src/lib/scheduling/day-context.ts`.
- **Database** lives at `prisma/dev.db` (SQLite), managed via Prisma
  migrations in `prisma/migrations`.
