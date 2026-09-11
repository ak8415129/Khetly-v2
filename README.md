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
pnpm db:migrate
pnpm dev:api    # terminal 1
pnpm dev:web    # terminal 2
```
Open http://localhost:3000

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
