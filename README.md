# 🌾 Khetly — Farm Rental Marketplace

Full-stack monorepo marketplace connecting urban renters with verified farmers.
**Auth: Google Sign-In (Firebase)** · **Roles: Renter, Farmer, Admin**

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| State | Zustand + React Query |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | Google Sign-In via Firebase (Admin SDK verifies tokens, API issues its own JWT) |
| Monorepo | pnpm workspaces + Turborepo |

## ⚠️ Start Here

Before running anything, read **`FIREBASE_SETUP_GUIDE.md`** — you must create a free
Firebase project and fill in both `.env` files before the app will start correctly.

## Quick Setup (after Firebase is configured)

```bash
pnpm install
pnpm db:deploy
pnpm dev:api    # terminal 1
pnpm dev:web    # terminal 2
```
Open http://localhost:3000

## Supabase database setup

The API uses Prisma with Supabase Postgres. Configure both connection strings in
`apps/api/.env`:

- `DATABASE_URL`: Supavisor transaction pooler, port `6543`, with `pgbouncer=true`.
- `DIRECT_URL`: Supavisor session pooler, port `5432`, for Prisma migrations.

Use `%40` for an `@` character in the database password. Apply committed
migrations with:

```bash
pnpm db:deploy
```

For local schema development, use `pnpm db:migrate`. Do not use
`prisma migrate reset` against Supabase unless you intentionally want to delete
the database contents.

## Deployment

### Vercel frontend

Import the repository into Vercel. The included `vercel.json` builds the
`apps/web` workspace and rewrites SPA routes such as `/explore` and
`/admin/bookings` to the React entry point. Set these environment variables:

- `VITE_API_URL`: deployed Render API URL, without `/v1` at the end.
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### Render backend

Create a Web Service from the repository. The included `render.yaml` runs the
Prisma Client generation, database migration, builds the API, starts it, and checks `/health`. Set the
secret values marked `sync: false` in Render. Set `FRONTEND_URL` to the final
Vercel URL, then add that Vercel domain to Firebase Authentication's authorized
domains.

If Render's Root Directory is `apps/api`, use these commands instead:

```bash
pnpm install --frozen-lockfile && pnpm db:deploy && pnpm build
pnpm start
```

## Project Structure

```
khetly/
├── apps/
│   ├── web/          # React frontend (port 3000)
│   └── api/          # Express backend (port 4000)
└── packages/
    ├── types/        # Shared TypeScript types
    └── utils/        # Shared utility functions
```

## Roles

- **Renter** — browses and books farmland
- **Farmer** — lists land (goes to `PENDING_REVIEW` until an admin approves it)
- **Admin** — auto-assigned to the email set as `FIRST_ADMIN_EMAIL` in `apps/api/.env`
  on first Google sign-in. Manages listing approvals, farmer verification, and users
  at `/admin/dashboard`.

## VS Code Extensions
- ESLint, Prettier, Tailwind CSS IntelliSense, Prisma
