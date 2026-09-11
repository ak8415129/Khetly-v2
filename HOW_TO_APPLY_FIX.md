# 🔧 Khetly Bug Fix — OTP Login Error

## The Problem
Error: `Cannot read properties of undefined (reading 'name')`
This happened because the API response wrapper `{ success, data }` 
was not being unwrapped correctly on the frontend.

## How to Apply This Fix

Copy each file from this ZIP into your khetly project folder,
replacing the existing file at the same path.

### Files to Replace (5 files total):

| File in this ZIP | Copy to your project |
|---|---|
| `apps/web/src/lib/api-client.ts` | Replace `khetly/apps/web/src/lib/api-client.ts` |
| `apps/web/src/modules/auth/auth.store.ts` | Replace `khetly/apps/web/src/modules/auth/auth.store.ts` |
| `apps/web/src/modules/auth/auth.service.ts` | Replace `khetly/apps/web/src/modules/auth/auth.service.ts` |
| `apps/web/src/modules/auth/auth.hooks.ts` | Replace `khetly/apps/web/src/modules/auth/auth.hooks.ts` |
| `apps/web/src/modules/auth/ProtectedRoute.tsx` | Replace `khetly/apps/web/src/modules/auth/ProtectedRoute.tsx` |
| `apps/api/src/modules/auth/auth.service.ts` | Replace `khetly/apps/api/src/modules/auth/auth.service.ts` |

## Steps After Copying

1. Stop the running API (Ctrl+C in API terminal)
2. Stop the running frontend (Ctrl+C in web terminal)
3. Copy all files above into your project
4. Restart API:
   ```
   pnpm dev:api
   ```
5. Restart frontend:
   ```
   pnpm dev:web
   ```
6. Open http://localhost:3000
7. Enter phone number → Get OTP → Check API terminal for OTP code → Enter it → Login works!

## What Was Fixed

1. `api-client.ts` — Now correctly unwraps `{ success: true, data: <payload> }` 
   so all API calls return the inner payload directly
   
2. `auth.hooks.ts` — Removed infinite loop in useMe, fixed onSuccess handler
   to safely read user/tokens/isNewUser from response
   
3. `auth.store.ts` — Added missing `setTokens` and `updateUser` methods

4. `auth.service.ts` (frontend) — Simplified to use unwrapped responses

5. `auth.service.ts` (API) — Ensured user object always has all required fields
