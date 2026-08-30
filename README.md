# TimeScheduler

A single-user personal productivity & time intelligence dashboard: college
timetable, commute/rest buffers, study planning, habit auto-scheduling, and
daily task tracking, all on one clean daily view.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + PostgreSQL (via the `@prisma/adapter-pg` driver adapter — works
  with any standard Postgres host: Neon, Supabase, a local instance, etc.)
- Single-user auth: bcrypt password hash + signed JWT session cookie (no
  third-party auth service)
- Vitest for the scheduling engine's unit tests

## Getting started

You need a Postgres database (local, or a free one from
[Neon](https://neon.tech)/[Supabase](https://supabase.com)).

```bash
npm install
cp .env.example .env      # set DATABASE_URL to your Postgres connection string,
                           # and AUTH_SECRET to a random value
npx prisma migrate deploy
npm run dev
```

Open http://localhost:3000. The first visit walks you through one-time
account setup (this app supports exactly one user).

## Deploying

The lean free path: push to GitHub, create a free
[Neon](https://neon.tech) Postgres database, then import the repo on
[Vercel](https://vercel.com) (Framework Preset: Next.js) and set the
`DATABASE_URL` (your Neon connection string) and `AUTH_SECRET` environment
variables in the Vercel project settings. Vercel redeploys automatically on
every push to this branch.

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
- **Database** is Postgres, managed via Prisma migrations in
  `prisma/migrations`. The connection uses a plain `pg` pool adapter rather
  than a provider-specific driver, so any standard Postgres host works —
  including Neon's pooled connection string, which is what a serverless
  deploy (Vercel) needs.
