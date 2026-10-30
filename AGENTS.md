# AGENTS.md — Southwood Dialysis Center

Read `docs/BUILD_PLAN.md` before doing anything. It is the authoritative spec (architecture, schema, phases, security model, landmines). This file only states the rules that must never be broken.

## Stack

Next.js 14.2 (App Router) · React 18 · TypeScript · Tailwind 3.4 (custom `brand`/`sand`/`ember`/`ink` tokens) · Vercel.
Data: Google Sheets ("CloudBase DB") via a Google Apps Script Web App · files: Telegram Bot · email: Resend.

## Non-negotiable rules

1. **The public design is frozen.** Never change the look of `/`, `/about`, `/services`, `/news`, `/contact`. New features get their own route groups (`app/(admin)`, `app/(portal)`) with their own layouts.
2. **Content always falls back to the shipped copy.** Merging DB content over in-file defaults is what keeps the site intact when Sheets is empty or down. Never render an empty state where the hardcoded copy used to be.
3. **Server-side only for external calls.** The browser must never see the Apps Script URL, the shared secret, the Telegram token, or the spreadsheet ID.
4. **No secrets in the repo.** Apps Script secrets live in Script Properties; the app's live in Vercel env. `.env*` stays gitignored.
5. **Replace, don't patch, the broken scaffolding** (`lib/auth.ts`, `lib/useAuth.ts`, `middleware.ts`, `app/admin/*`, `app/portal/*`). Do not build on top of them.
6. **Structured content fields only** — no free-form HTML/CSS injection from the admin dashboard.
7. **Never silence a check to make it pass.** No new `@ts-ignore`, no skipping tests, no widening types. `typescript.ignoreBuildErrors` in `next.config.js` is temporary debt to be removed in Phase 8.
8. **Preserve the user's changes.** Stage only task-related files; no destructive git commands without explicit instruction.

## Delivery

Freebuff's Changes panel owns commits and pushes; only run git delivery commands when the user asks.
Verify with `npm run build`; use `freebuff-preview restart` (its own command) to check the running app — never start `next dev` manually.

## Known landmines

- `components/ui/button-styles.ts` must stay client-free — moving it into the `"use client"` button file crashes server-component prerendering.
- Apps Script always responds HTTP 200; read the JSON `ok` field instead of `res.ok`.
- Sheets has no transactions: every write needs `LockService`.
- DaisyUI is configured off (`base: false`, `styled: false`); its classes do nothing.
- The logo is `public/SBDC.png`, referenced as `/SBDC.png` (no `logo.svg`).
- No stock photos — the design is intentionally photo-free.
- This sandbox cannot display images; do not claim visual verification you did not perform.
