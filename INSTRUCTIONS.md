# 🔧 Khetly Session Fix — "Session Timeout / Logout" Bug

## Root Cause
The JWT access token was expiring after 15 minutes (default).
When it expired, the refresh logic was broken so it logged you out instead of refreshing silently.

## What This Fix Does
1. Sets access token expiry to 7 days (dev mode) — no more quick logouts
2. Fixes the token refresh logic in api-client.ts
3. Fixes the auth store to properly save/restore tokens after page refresh
4. Improves error handling so a failed request doesn't force logout

---

## Step 1 — Copy these files into your khetly project

| File in this ZIP | Paste into your project at |
|---|---|
| `apps/api/.env` | `khetly/apps/api/.env` |
| `apps/api/src/config/env.ts` | `khetly/apps/api/src/config/env.ts` |
| `apps/api/src/lib/jwt.ts` | `khetly/apps/api/src/lib/jwt.ts` |
| `apps/api/src/middleware/auth.middleware.ts` | `khetly/apps/api/src/middleware/auth.middleware.ts` |
| `apps/web/src/lib/api-client.ts` | `khetly/apps/web/src/lib/api-client.ts` |
| `apps/web/src/modules/auth/auth.store.ts` | `khetly/apps/web/src/modules/auth/auth.store.ts` |
| `apps/web/src/modules/auth/auth.service.ts` | `khetly/apps/web/src/modules/auth/auth.service.ts` |
| `apps/web/src/modules/auth/auth.hooks.ts` | `khetly/apps/web/src/modules/auth/auth.hooks.ts` |
| `apps/web/src/modules/auth/ProtectedRoute.tsx` | `khetly/apps/web/src/modules/auth/ProtectedRoute.tsx` |

## Step 2 — Clear old tokens from browser

1. Open http://localhost:3000 in browser
2. Press F12 → Application tab → Local Storage → http://localhost:3000
3. Delete the `khetly-auth` key (right click → delete)
4. Close DevTools

## Step 3 — Restart both servers

```bash
# Stop API (Ctrl+C) then restart:
pnpm dev:api

# Stop frontend (Ctrl+C) then restart:
pnpm dev:web
```

## Step 4 — Login again

1. Go to http://localhost:3000
2. Enter phone number → click Get OTP
3. Check API terminal for OTP code
4. Enter OTP → you're in!

Now sessions will last 7 days and farmers can add listings without being logged out.
