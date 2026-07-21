# Debugging Notes

## Issue 1: Login returns 401 "Invalid email or password"

### Problem

Users could not log in through the UI even with the demo email
`bob.agent@example.com` or `dave.requester@example.com`. The login form showed
"Invalid email or password" and the network tab showed HTTP 401 on `POST /api/auth/login`.

### How I Investigated

1. Checked that both frontend (`localhost:5173`) and backend (`localhost:4000`) were running.
2. Inspected the network request payload in browser DevTools — email was correct but password was `Password123` (missing `!`).
3. Verified users exist in SQLite with password hashes:
   ```sql
   SELECT email, role FROM User;
   ```
4. Called the login API directly from the terminal:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
     -Method POST -ContentType "application/json" `
     -Body '{"email":"bob.agent@example.com","password":"Password123!"}'
   ```
   This returned a valid JWT, confirming the backend and database were correct.
5. Noted backend startup warning: `JWT_SECRET is not set` — investigated but confirmed this only affects token signing fallback, not login password verification.

### How AI Helped

- AI traced the auth flow from `LoginPage` → `authContext` → `api.login` → `authService.login`.
- AI identified the seed password in `.env.example` (`SEED_PASSWORD="Password123!"`) and cross-referenced `prisma/seed.ts`.
- AI updated the login page hint text to show the correct password explicitly.

### What I Validated

- Direct API login with `Password123!` succeeds (200 + token).
- Direct API login with `Password123` (no `!`) fails (401).
- All five seeded users have bcrypt password hashes in the database.
- The issue was user input / autofill, not a code bug in the auth service.

### Final Fix

- **No code fix required** — the password must include the trailing `!`.
- Updated `LoginPage.tsx` demo hint to display: `Default password: Password123!`
- Documented seeded credentials in `README.md` and `candidate-info.md`.
- Advised clearing `localStorage` (`stms.token`) if a stale session caused confusion after failed attempts.

---

## Issue 2: Backend shows "JWT_SECRET is not set" on startup

### Problem

Backend logs a warning on `npm run dev`:
```
[config] JWT_SECRET is not set. Using an insecure development fallback.
```

### How I Investigated

- Read `backend/src/config.ts` — falls back to `"dev-only-insecure-secret-change-me"` when `JWT_SECRET` is missing.
- Confirmed `.env` file exists in `backend/` but may not be loaded if the dev process was started before `.env` was created.

### How AI Helped

- AI identified that `tsx watch src/index.ts` reads `process.env` at startup; `.env` must exist before launching.

### What I Validated

- Login still works with the fallback secret for local development.
- This warning does not cause 401 on login (password verification is separate from JWT signing).

### Final Fix

- Ensure `backend/.env` exists (copy from `.env.example`).
- Set `JWT_SECRET` to any non-empty string for local dev.
- Restart the backend after creating/updating `.env`.

---

## Issue 3: UI changes — verifying no regression in core flows

### Problem

After replacing the ticket table with a card grid and adding theme/toast contexts,
needed to confirm existing CRUD and auth flows still worked.

### How I Investigated

1. Ran `npx tsc --noEmit` in both `frontend/` and `backend/` — zero errors.
2. Ran `npm test` in `backend/` — all integration tests green.
3. Manual smoke test: login → list tickets → create → detail → status change → comment.

### How AI Helped

- AI scaffolded new components (`TicketCard`, `ThemeToggle`, `toastContext`) while preserving existing API client and auth context interfaces.
- AI added `DELETE /api/tickets/:id` endpoint and wired it to the card Delete button.

### What I Validated

- `RequireAuth` still redirects unauthenticated users.
- `api/client.ts` still sends `Authorization: Bearer` header.
- Status changes still go through `POST /api/tickets/:id/status` only.
- Role-gated buttons (Edit, Delete) hidden for REQUESTER role.

### Final Fix

No regression found. TypeScript compilation and integration tests confirmed correctness.
