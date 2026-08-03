# Health OS

Health OS is a personal digital health platform for daily training and health management.

The long-term vision is an AI-powered operating system for personal health management. The v0.1.0
MVP intentionally stays local, manual, and modular.

## Technology Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Prisma
- PostgreSQL
- Node test runner
- ESLint
- Prettier

## Local Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

The development app runs at `http://localhost:3000` unless that port is already in use.

## Environment Variables

Create `.env` with:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

## Database Commands

```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

`npm run db:seed` is development-only and refuses to run when `NODE_ENV=production`.

To reset local development data:

```bash
npx prisma migrate reset
npm run db:seed
```

## Development Commands

```bash
npm run dev
npm run test
npm run lint
npm run format:check
npm run build
```

## Current MVP Scope

- Today Home
- Cardio Log
- Strength Training Log
- Route Management
- Goal Management
- Journal
- Settings placeholder

## Explicitly Excluded From v0.1.0

- AI Coach
- Apple Health
- Garmin
- Strava
- Google Calendar
- Weather
- Notifications
- Advanced charts
- New health modules
- Multi-user UI
- Cloud deployment infrastructure

## Architecture Notes

Health OS follows a modular, DDD-friendly structure. Each module owns its domain schemas,
repository contracts, infrastructure implementation, and presentation components.

Today uses an application-level query service to aggregate read models from Cardio, Strength,
Goals, Journal, and Routes. Today does not directly query Prisma or own module-specific business
rules.

## v0.1.0 Release Readiness Checklist

- CRUD workflows: Cardio, Strength, Routes, Goals, and Journal support create, read, update, and delete/deactivate flows.
- Data persistence: Prisma Postgres persistence is configured for production and covered by smoke tests.
- Today aggregation: Today displays focus, weekly summary, recent activity, active goals, and latest journal context from module repositories.
- Mobile usability: Forms use responsive one-column layouts on small screens and avoid table-only layouts.
- Validation: Domain and form schemas enforce cardio activity rules, positive distances/durations, rating ranges, date ranges, URL validity, and nested strength structure.
- Error handling: App-level loading, error, and not-found states are present. Today isolates module query failures.
- Test status: `npm run test` covers conversions, pace, weekly ranges, activity sorting, goal progress, route deletion policy, validation boundaries, relations, and ownership filters.
- Build status: `npm run build` should pass before tagging.
- Known limitations: listed below.

## Known Limitations

- Settings is still a placeholder; timezone currently comes from the MVP owner record.
- There is no authentication or multi-user UI.
- Goal progress is deterministic and simple; custom goals do not invent percentages.
- Race time and pace goals store manual numeric values without specialized unit-specific editing.
- No AI, wearable sync, external integrations, charts, or notifications are included.
