# ScamSmart

ScamSmart is a small Estonian-language web app that teaches teenagers and parents to recognise
common scams (SMS phishing, fake web shops, social/gaming scams, payment and authentication
fraud). It has three parts: **Õpi** (4 learning modules), **Proovi ennast** (12-question quiz with
a pre-written "ScamSmart Coach") and **Minu edasijõudmine** (anonymous progress).

All example scams are fictional (`.example` domains, no real brands). There is no login: each
browser gets an anonymous random learner id.

## Stack

Next.js 15 (App Router, TypeScript), Tailwind CSS, Prisma 6, PostgreSQL on Railway.

## Deployment (Railway)

- Railway deploys automatically from the `main` branch.
- Variable on the web service: `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`.
- Build command: `npm run build` (runs `prisma generate` and `next build`).
- Start command: `npm start` (runs `prisma migrate deploy`, then the idempotent seed, then `next start`).

## Content

Learning content lives in `content/scamsmart-content.json` and is loaded into the database by
`prisma/seed.ts` on every start. Edit the JSON, push, and Railway updates the content.

## API

| Route | Purpose |
| --- | --- |
| `GET /api/modules`, `GET /api/modules/[id]` | Module list and details |
| `POST /api/modules/[id]/complete` | Mark a module as done |
| `GET /api/questions` | Shuffled quiz questions (no answers) |
| `POST /api/attempts` | Submit an answer, get feedback and coach message |
| `GET /api/progress`, `DELETE /api/progress` | Read or reset anonymous progress |

The learner id is sent in the `x-learner-id` header.
