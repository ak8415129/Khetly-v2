# 🔐 Khetly — Google Sign-In + Admin Setup Guide

This replaces phone OTP with **Google Sign-In** (via Firebase) and adds a full **Admin role**
that approves farmer listings, verifies farmer identities, and manages users.

---

## Part 1 — Create a Firebase Project (5 minutes, free)

1. Go to **https://console.firebase.google.com**
2. Click **Add project** → name it `khetly` → disable Google Analytics (not needed) → **Create project**
3. Once created, click the **Web icon (`</>`)** to add a web app
   - App nickname: `khetly-web`
   - Click **Register app**
   - You'll see a config object like this — **copy these values**:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "khetly-xxxxx.firebaseapp.com",
     projectId: "khetly-xxxxx",
     storageBucket: "khetly-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   }
   ```

4. In the left sidebar, click **Authentication** → **Get started**
5. Click **Sign-in method** tab → click **Google** → toggle **Enable** → set a support email → **Save**

6. Click **Authentication** → **Settings** tab → **Authorized domains**
   - Add `localhost` (already there by default)
   - Later, add your production domain here too (e.g. `khetly.vercel.app`)

---

## Part 2 — Get Firebase Admin Credentials (for the backend)

1. In Firebase Console, click the **gear icon** → **Project settings**
2. Go to **Service accounts** tab
3. Click **Generate new private key** → confirm → a `.json` file downloads

4. Open that JSON file — it looks like this:
```json
{
  "type": "service_account",
  "project_id": "khetly-xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBAD...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@khetly-xxxxx.iam.gserviceaccount.com",
  ...
}
```

5. You need 3 values from this file: `project_id`, `private_key`, `client_email`

---

## Part 3 — Configure Environment Variables

### 3A. Backend — `apps/api/.env`

Open this file and fill in the values from Part 2:

```env
FIREBASE_PROJECT_ID=khetly-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@khetly-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBAD...\n-----END PRIVATE KEY-----\n"
```

⚠️ **Important**: Keep the `\n` characters exactly as they appear in the JSON — don't replace them with real line breaks. Keep the quotes around the whole key.

Also set who your first admin will be — **use your own Gmail address**:
```env
FIRST_ADMIN_EMAIL=youremail@gmail.com
```
The first time you sign in with this exact Google account, you'll automatically become an Admin.

---

### 3B. Frontend — `apps/web/.env`

Open this file and fill in the values from Part 1:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=khetly-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=khetly-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=khetly-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## Part 4 — Update Database Schema

For Supabase, the database must receive the committed Prisma migration before
Google login can create the first user. Configure `DATABASE_URL` with the
Supavisor transaction pooler (port `6543`) and `DIRECT_URL` with the Supavisor
session pooler (port `5432`). If the password contains `@`, write it as `%40`
in both URLs.

Apply the migration with:

```bash
pnpm db:deploy
```

For a disposable local database only, use:

```bash
pnpm db:migrate
```

Do not run `migrate reset` against Supabase; it deletes existing data. If the
database already contains tables created outside Prisma, introspect it first
and reconcile migrations rather than resetting it.

---

## Part 5 — Install New Dependencies

```bash
pnpm install
```

This installs `firebase` (frontend) and `firebase-admin` (backend).

---

## Part 6 — Run the Project

```bash
# Terminal 1
pnpm dev:api

# Terminal 2
pnpm dev:web
```

Open **http://localhost:3000**

---

## Part 7 — Test It

1. Click **Continue with Google**
2. A Google popup opens → choose your account → allow
3. If your email matches `FIRST_ADMIN_EMAIL` → you land on `/admin/dashboard` directly (no role selection needed)
4. Any other email → you'll be asked to pick **Renter** or **Farmer** → fill your name → continue

---

## How the Admin Role Works

- **Only you** (via `FIRST_ADMIN_EMAIL`) get auto-promoted to admin on first login
- To make someone else an admin later, update their role directly in the database:
  ```sql
  UPDATE users SET role = 'ADMIN', "profileCompleted" = true WHERE email = 'newadmin@gmail.com';
  ```
- Admins get a separate dark-themed dashboard at `/admin/dashboard` with:
  - **Platform stats** — total users, farmers, listings, revenue
  - **Pending Listings** — approve/reject farmer submissions before they go live
  - **Farmer Verification** — approve/reject Aadhaar + bank details
  - **Users** — search, suspend, or reactivate any account
  - **Audit log** — every admin action is recorded (who did what, when, why)

## How Listing Approval Now Works

1. Farmer creates a listing → status becomes `PENDING_REVIEW` (not visible to renters yet)
2. Admin reviews it in `/admin/listings` → approves or rejects with a reason
3. If approved → status becomes `ACTIVE` → now visible in Explore search
4. If rejected → farmer sees the rejection reason on their listing and can edit + resubmit
5. If a farmer edits an already-**ACTIVE** listing → it goes back to `PENDING_REVIEW` automatically (prevents farmers changing approved listings to something else without review)

---

## Common Errors & Fixes

| Error | Fix |
|---|---|
| `Firebase: Error (auth/unauthorized-domain)` | Add your domain to Firebase Console → Authentication → Settings → Authorized domains |
| `FIREBASE_PROJECT_ID is required` | You didn't fill in `apps/api/.env` — go back to Part 3A |
| Google popup closes immediately, no error | Check that Google sign-in method is **enabled** in Firebase Console (Part 1, step 5) |
| `invalid_grant` or private key errors | Your `FIREBASE_PRIVATE_KEY` has broken `\n` characters — copy it exactly from the downloaded JSON, keep it wrapped in quotes |
| You're not landing on `/admin/dashboard` | Your Google email doesn't match `FIRST_ADMIN_EMAIL` exactly (case-sensitive) — check for typos |

---

## Deploying to Production Later

When you deploy (Vercel + Render, as discussed earlier):

1. Add your production URL to Firebase → Authentication → Settings → Authorized domains
   (e.g. `khetly.vercel.app`)
2. Set the same environment variables in Render (backend) and Vercel (frontend) dashboards
3. Update `FRONTEND_URL` in the API's production env to your real Vercel URL
