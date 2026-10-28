# Accounts Feature (Business Package)

This folder is a stub. The accounts feature is disabled in Starter (`features.accounts = false`).

## To enable for Business

1. Set `accounts: true` in `src/app/config/features.ts`
2. Requires a backend authentication service (Supabase, Firebase Auth, or custom JWT)
3. Follow the step-by-step guide in `docs/ADDING_A_FEATURE.md`

## What goes here

- `components/` — LoginForm, RegisterForm, ProfilePage, OrderHistory
- `hooks/` — useAuth.ts, useProfile.ts
- `types.ts` — User, Session Zod schemas
- `index.ts` — public API
- `__tests__/`

## Security note

Do NOT implement auth with localStorage tokens alone. Use HttpOnly cookies via a backend.
See `docs/SECURITY.md` — "Limits of a frontend-only app".
