# Southwood Dialysis Center — Build Plan & Handoff Spec

**Version:** 1.0
**Last updated:** 2026-10-30
**Current phase:** Phase 0 complete, Phase 1 auth started, Phase 3+ admin UI still compiling
**Owner:** Mike Nielsen (repo owner)

---

## Para sa iyo (Tagalog TL;DR)

- Ang website ay **tapos na at maganda na** — `/`, `/about`, `/services`, `/news`, `/contact`. **Hindi ito babagalawin** sa itsura.
- Ang susunod na gagawin: **Admin Dashboard + Patient Portal + CMS**, na ang database ay **Google Sheets** (pinangalanang "CloudBase DB"), pinaglilingkuran ng **Google Apps Script (.gs)** bilang API, at **Telegram Bot** para sa files/PDF lab results.
- Bawat phase ay may checklist sa ibaba. Sundin mula sa itaas pababa; huwag laktawan ang Phase 0 at 1.
- Lahat ng desisyon (encryption, OTP, rate limiting, caching) ay nakatala sa §4 at §7 — huwag nang baguhin nang walang approval.

---

## 0. How the next AI should resume

1. Read `AGENTS.md` (repo root) — non-negotiable rules.
2. Read this file fully before writing code.
3. `git tag --list` → confirm `v1.0-design` exists (the frozen good design). If missing, create it from the current commit **only after** confirming the site still builds.
4. Check `git log --oneline -5` and `git status` to see what the previous session left uncommitted.
5. Continue from the **first unchecked item** in §11 (Phases). Never skip ahead; each phase ends deployable.
6. Run the verification protocol in §13 before claiming a phase is done.

**Never** restart the dev server manually. Use `freebuff-preview restart` (own command, never chained).

---

## 1. Non-negotiable rules

1. **The public design is frozen.** No visual, spacing, typography or copy changes to `/`, `/about`, `/services`, `/news`, `/contact` unless the user explicitly asks. Changes are limited to *where the data comes from*, never how it looks.
2. **Every content-driven section must have a fallback** to the exact copy currently hardcoded in the component. If Sheets is empty, slow, unreachable, or misconfigured, the page renders identically to the shipped design. A DB failure must never produce a blank or broken page.
3. **All Google Apps Script and Telegram calls happen server-side only** (Route Handlers / Server Actions / server components). The browser must never receive the `.gs` URL, the shared secret, the bot token, or the spreadsheet ID.
4. **No secrets in the repo.** No `.env`, no keys in `.gs` source (use Apps Script *Script Properties*), no tokens in client bundles. `.gitignore` already covers `.env` and `*.local`.
5. **No dead code, no broken types left behind.** The old broken scaffolding (`lib/auth.ts`, `lib/useAuth.ts`, `middleware.ts`, `app/admin/*`, `app/portal/*`) is to be **replaced**, not patched. Delete files that are superseded instead of leaving them orphaned.
6. **Structured content editing only.** Admin edits text/images/links/order/meta. Admin cannot inject arbitrary HTML/CSS/JS and cannot change layout. This is deliberate: it is what lets a non-developer run the site without breaking the design.
7. **Never weaken a check to make it pass.** No `ignoreBuildErrors`, no `@ts-ignore` to silence real errors, no skipping a test. The current `next.config.js` has `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` from an earlier emergency; **removing them is part of Phase 8**, and the real errors must be fixed at that point.
8. **Preserve pre-existing user changes.** Stage only files belonging to the current task. No destructive git commands (`reset --hard`, `clean -fd`, force-push, history rewrite) without explicit instruction.

---

## 2. Current state (2026-10-30)

### 2.1 Shipped and working

| Area | Files | Notes |
|---|---|---|
| Design tokens | `tailwind.config.ts` | `brand` (deep green #0B2C26…#F0F6F4), `sand` (cream #FCFAF6…), `ember` (copper #D07C3C…), `ink`; `fontFamily.display` serif stack; `maxWidth.shell` = 1240px |
| Global CSS | `app/globals.css` | base/component/utility layers: `.shell`, `.eyebrow`, `.display`, `.lead`, `.hairline`, `.reveal-ready`, `.grain`, reduced-motion block. Body bg = `theme('colors.sand.50')` |
| Chrome | `components/layout/header.tsx`, `footer.tsx`, `footer-part1.tsx`, `footer-part2.tsx` | Utility bar, active nav, working mobile drawer (scroll lock, `aria-expanded`, `invisible` when closed) |
| Sections | `hero`, `services`, `about`, `process`, `testimonials`, `news`, `cta`, `contact`, `pageheader` under `components/sections/` | All photo-free by design (no stock photos available/verifiable in this environment) |
| UI primitives | `components/ui/button.tsx`, `button-styles.ts`, `reveal.tsx`, `input.tsx` | `buttonClasses()` lives in the client-free `button-styles.ts` — importing it from a `"use client"` module into a server component previously crashed prerendering (`TypeError: (0 , p.J) is not a function`). **Do not merge them back.** |
| Pages | `app/page.tsx`, `app/about`, `app/services`, `app/news`, `app/contact` | `/contact` has a `mailto:` form (no API route existed at the time) |
| Assets | `public/SBDC.png`, `public/favicon.svg`, `public/og-home.svg` | Logo lives at `public/SBDC.png` and is referenced as `/SBDC.png` |
| Build | — | `npm run build` passes, 14 routes, 200 on all public pages |

DaisyUI is installed but effectively disabled (`base: false`, `styled: false` in `tailwind.config.ts`) because no surviving page uses daisyUI classes.

### 2.2 Broken / to be replaced (do not "fix" — replace)

| File | Problem |
|---|---|
| `lib/auth.ts` | Truncated (ends at `return response` with no closing braces → syntax error). Security is fictional: `const isValid = true` accepts **any** password; "hash" is `randomBytes`; `verifyToken()` HMACs the token itself and returns a substring — it verifies nothing. |
| `lib/useAuth.ts` | Client hook that fetches `/api/auth/session`, `/api/auth/login`, `/api/auth/logout` — **none of these routes exist**. Exposes `session.route` / `session.setRoute` that nothing sets. Approve/reject user actions are empty functions. |
| `middleware.ts` | Untyped `request` param; treats `/` as a public auth page; redirects to `/portal` (which does not exist — actual path is `/portal/dashboard`); gates admin on `userRole === 'Super Admin'` only. |
| `app/admin/layout.tsx` | `useRouter()` **inside** `useEffect` (Rules of Hooks violation), `session.collapsed` on a non-existent field, logo with `className="blur-lg"`, daisy-era orange styling. |
| `components/admin/sidebar.tsx` | SVG icon with `path d="M"` (blank), `h-screen w-64` that overlays content on mobile, active state depends on non-existent `session.route`. |
| `app/admin/*/page.tsx` | Render mock arrays that are always empty (`analyticsData`, `inquiries`, `testimonials`, `users` are all initialised to `null`/`[]`), plus real JSX bugs (`${...}` inside JSX text in inquiries/testimonials). |
| `app/portal/login/page.tsx` | Calls the non-existent login endpoint; on failure it swallows the error and resets loading — no message shown. |
| `app/portal/dashboard/page.tsx` | Placeholder cards, `user.name` never set, no data source. |
| `lib/seo.ts` | Uses `Metadata['tweets']` and `appLinks.canonical`, which are not valid (should be `twitter` and `alternates.canonical`). Currently unused by pages. |
| `REMAINING_TASKS.md` | Historical checklist from the pre-redesign era. Mostly obsolete; treat as context only, and delete it in Phase 8 once this doc supersedes it. |

### 2.3 Missing entirely

- Any database, any `app/api` route, any auth, any upload path.
- `app/sitemap.ts`, `app/robots.ts`, canonical tags, JSON-LD, `llms.txt`.
- Privacy Policy / Terms / consent UI / legal disclaimer.
- Social media icons in the footer (the original wireframe requires them; the redesign ships without them — add in Phase 7 by pulling URLs from `Settings`).

---

## 3. Target architecture

```
Browser  (public site · /admin · /portal)
   │  HTTPS, HttpOnly session cookie (JWT)
   ▼
Next.js 14 App Router on Vercel        ← ALL secrets live here (env vars)
   │
   ├──► Google Apps Script Web App (.gs)  ──► Google Sheets  ("CloudBase DB")
   │        shared secret + HMAC-SHA256          ├── ContentDB tabs
   │        RPC only, no generic query           ├── SecurityDB tabs
   │        LockService on writes                └── Files index + system tabs
   │
   ├──► Telegram Bot API  ──► encrypted lab PDFs + site images
   │
   └──► Resend  ──► login OTP + appointment reminders
```

**Data flow rules**

- Public pages: **zero** Sheets calls at request time. Content is fetched at build/revalidate, cached with `unstable_cache` + tags, and served from the CDN.
- Admin/portal: live reads (300–800 ms acceptable), every mutation goes through a Route Handler with authz.
- One aggregated public read (`public.getContent`) so a single Apps Script call hydrates the whole marketing site at revalidation time.
- Publish in admin → `revalidateTag('content')` → site updates in ~1–2 s. No fixed timer delay for the user who published.

---

## 4. Confirmed decisions (do not re-litigate without approval)

| # | Decision | Rationale |
|---|---|---|
| 1 | **Google Sheets as the database**, named "CloudBase DB", fronted by Apps Script | Zero budget. Sheet name is cosmetic; code and UI use the neutral names ContentDB / SecurityDB / FilesDB. |
| 2 | **Telegram Bot for FilesDB** (images + lab PDFs) | Free, no storage bill. 20 MB download / 50 MB upload via Bot API — ample for lab PDFs. |
| 3 | **Lab PDFs encrypted before upload** (AES-256-GCM), key in env | Telegram is a third-party processor outside PH; under RA 10173 we minimise exposure by sending ciphertext only. |
| 4 | **Email OTP only** (Resend) | No SMS budget. Semaphore/Twilio can be added later behind the same interface. |
| 5 | **Rate limiting in the Sheet** (`Users.failed_count`, `Users.locked_until`, `LoginAttempts`) | No Upstash. Single-writer enforcement via `LockService` makes it effective for 120 patients. Upgrade path documented in §7.6. |
| 6 | **Public pages pre-rendered + on-demand revalidate** | "Dapat hindi mabagal" — visitors never wait on Sheets. |
| 7 | **Structured fields, not free-form WYSIWYG** | A non-developer must not be able to break the layout. |
| 8 | **Vercel hosting** (repo already pushes to Vercel `main`) | Existing workflow; `freebuff-preview` used for in-sandbox verification. |

---

## 5. Data model — 18 tabs, auto-created by `setup()`

All tabs are created **by the system**, idempotently (`create if missing`). Existing tabs and rows are never deleted or reordered. Migrations only add columns and bump `_Meta.schema_version`.

Conventions: `id` = `crypto.randomUUID()` string; timestamps = ISO-8601 UTC strings; `ip_hash` / `ua_hash` = SHA-256 with `HASH_PEPPER` (never raw IPs); booleans stored as `TRUE`/`FALSE`; enums enforced by data validation.

### ContentDB

| Tab | Columns |
|---|---|
| `Pages` | id, slug, title, meta_title, meta_description, h1, og_image, status(`draft`\|`published`), updated_at, updated_by |
| `Sections` | id, page_slug, section_key, sort_order, eyebrow, heading, emphasis, body, image_url, image_alt, cta_label, cta_href, status |
| `Services` | id, slug, title, summary, icon, sort_order, status |
| `News` | id, slug, title, excerpt, body, cover_url, cover_alt, published_at, status |
| `Testimonials` | id, patient_cn, display_name, rating(1–5), body, status(`Pending`\|`Approved`\|`Rejected`), created_at, moderated_by, moderated_at |
| `Inquiries` | id, name, email, phone, subject, message, status(`New`\|`Read`\|`Closed`), created_at, handled_by, notes |
| `Settings` | key, value — hotline, address, hours, map_lat, map_lng, facebook, instagram, x, linkedin, gsc_verification, disclaimer, consent_version |

### SecurityDB

| Tab | Columns |
|---|---|
| `Users` | id, cn, full_name, email, phone, role(`Super Admin`\|`Admin`\|`Page Editor`\|`Patient`), password_hash (bcrypt), otp_required, is_active, must_change_password, failed_count, locked_until, last_login_at, created_at |
| `OtpCodes` | id, user_id, code_hash, purpose(`login`\|`reset`), expires_at, attempts, consumed_at |
| `LoginAttempts` | id, identifier, ip_hash, ua_hash, success, created_at |
| `AuditLog` | id, actor_id, actor_role, action, entity, entity_id, meta_json, ip_hash, created_at |
| `Consents` | id, user_id, version, accepted_at, ip_hash |

### Operational

| Tab | Columns |
|---|---|
| `Appointments` | id, patient_cn, scheduled_at, duration_min, chair, status(`Requested`\|`Confirmed`\|`Completed`\|`Cancelled`\|`No-show`), notes, reminder_sent_at, created_at, updated_at |
| `Queue` | id, appointment_id, patient_cn, state(`Waiting`\|`Ongoing`\|`Completed`), position, started_at, completed_at, updated_at |
| `Billing` | id, patient_cn, invoice_no, description, amount_php, status(`Unpaid`\|`Paid`\|`Partial`\|`Void`), issued_at, paid_at, notes |
| `Shifts` | id, staff_cn, starts_at, ends_at, station, notes, created_at |

### FilesDB + system

| Tab | Columns |
|---|---|
| `Files` | id, patient_cn, title, category(`lab`\|`image`), telegram_file_id, telegram_message_id, mime, size_bytes, checksum_sha256, encrypted, uploaded_by, uploaded_at, released_at, status |
| `_Meta` | key, value — schema_version, installed_at, last_setup_at, last_backup_at |

> Note: an earlier draft said "16 tabs"; the correct count including appointments/queue/billing/shifts is **18**.

---

## 6. Apps Script contract

### 6.1 Deployment (user does this once)

1. Create a blank Google Sheet named `CloudBase DB`.
2. `Extensions → Apps Script`. Paste the `.gs` from `google-apps-script/` (bound script → `SpreadsheetApp.getActive()`, so no Spreadsheet ID needs to be passed anywhere).
3. `Project Settings → Script Properties`: `GS_SHARED_SECRET`, `HASH_PEPPER`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
4. `Deploy → New deployment → Web app`: **Execute as: Me**, **Who has access: Anyone** (required so Vercel can call it; access is gated by the shared secret + HMAC).
5. Copy the `/exec` URL into Vercel as `GS_WEBAPP_URL`.
6. In the Sheet, use the custom menu **CloudBase DB → Run setup** (or call `?action=setup` with a valid signature).

### 6.2 Request format

`POST` with `Content-Type: application/json`, sent **only from the Next.js server**:

```json
{
  "action": "system.health",
  "payload": {},
  "auth": {
    "key": "<GS_SHARED_SECRET>",
    "ts": "<unix seconds>",
    "nonce": "<uuid>",
    "sig": "hex(HMAC_SHA256(secret, ts + \"\\n\" + action + \"\\n\" + canonical(payload)))"
  }
}
```

**The signature is in the body, not in HTTP headers** — Apps Script web apps cannot read custom request headers, so a header-based scheme would silently be unverifiable. TLS plus HMAC over the body gives the same guarantee.

`canonical()` is JSON with recursively sorted object keys, implemented twice and kept identical: `canonical_()` in `Code.gs` and `canonicalJson()` in `lib/sheets/canonical.ts`. Change one → change the other.

Validation order in `.gs`: secret present → constant-time key compare → timestamp within ±300 s → signature → nonce unused (CacheService, 10 min) → action exists.

### 6.3 Response format

Apps Script cannot set HTTP status codes, so **always HTTP 200** and the outcome is in the body:

```json
{ "ok": true,  "data": { } }
{ "ok": false, "error": { "code": "AUTH_FAILED", "message": "Invalid credentials" } }
```

`error.message` is user-safe. Stack traces, sheet names, and row numbers go to `Logger` only, never to the client.

### 6.4 Actions (RPC allowlist — no generic query, ever)

| Group | Actions |
|---|---|
| Public | `public.getContent` (pages + sections + services + news + approved testimonials + settings, one call) |
| Content | `content.listPages`, `content.getPage`, `content.upsertPage`, `content.getSections`, `content.upsertSection`, `content.reorderSections`, `content.listServices`, `content.upsertService`, `content.deleteService`, `content.listNews`, `content.upsertNews`, `content.getSettings`, `content.updateSettings` |
| Auth | `auth.findUserByCn`, `auth.setOtp`, `auth.consumeOtp`, `auth.recordAttempt`, `auth.registerFailure`, `auth.clearFailures`, `auth.setPasswordHash`, `auth.touchLogin` |
| Users | `users.list`, `users.create`, `users.update`, `users.setRole`, `users.setActive` |
| Inquiries | `inquiries.create`, `inquiries.list`, `inquiries.update` |
| Testimonials | `testimonials.create`, `testimonials.listApproved`, `testimonials.listAll`, `testimonials.moderate` |
| Appointments | `appointments.create`, `appointments.listMine`, `appointments.reschedule`, `appointments.cancel`, `appointments.listAll`, `appointments.setStatus` |
| Files | `files.register`, `files.listMine`, `files.get`, `files.release` |
| Ops | `queue.listToday`, `queue.setState`, `billing.listMine`, `billing.create`, `shifts.list`, `shifts.assign` |
| Analytics | `analytics.summary` (aggregates only, computed in `.gs`) |
| Audit | `audit.append`, `audit.list` |
| System | `setup`, `health`, `backup` |

Only the `system.*` group exists today (Phase 0). Every other group is registered in `ACTIONS` as its phase lands; until then the router answers `UNKNOWN_ACTION`.

### 6.5 Write safety

- Every mutating action wraps in `LockService.getScriptLock().tryLock(10000)` → wait → write → release. No partial rows.
- Row lookup by `id` via a cached index; never trust row numbers across calls.
- `setup()` creates missing tabs, writes the header row, applies frozen bold header + brand fill, sets column widths, adds enum dropdowns, protects `password_hash` / `code_hash` / `id` (warning-only), and records `schema_version` in `_Meta`. Safe to re-run.
- `backup()` copies the spreadsheet into a `CloudBase DB Backups` Drive folder with a dated name and updates `_Meta.last_backup_at`; a daily time-driven trigger runs it and prunes copies older than 30 days.
- `health()` returns tab names, row counts, schema version, whether secrets are set (never their values), and the last backup time.

---

## 7. Security model

### 7.1 Login (patients and staff)

1. `POST /api/auth/login` → validate shape (zod) → `auth.findUserByCn` → if inactive/locked → generic failure.
2. Verify password with **bcryptjs** in Node (Apps Script only has SHA-256, which is unsuitable; plaintext never leaves Vercel).
3. On success: create 6-digit OTP, store **hash** + expiry (10 min) + `attempts`, email it via Resend.
4. `POST /api/auth/verify-otp` → check hash, attempts (max 5), expiry → issue session.
5. Session = JWT (HS256, `jose`) with `{ sub, cn, role, ver }`, 8 h expiry, `HttpOnly; Secure; SameSite=Lax; Path=/`. `ver` increments on password change/logout-everywhere and invalidates old tokens.
6. Logout clears the cookie and appends an audit row.

Staff (`Super Admin`, `Admin`, `Page Editor`) may use **password + OTP** too; `must_change_password` forces a reset on first login.

### 7.2 Passwords

`bcryptjs` cost 12. Minimum 10 characters, reject common passwords, and no password is ever logged or returned by any API. First Super Admin is created by `setup()` with a random temporary password printed **once** in the setup response (user must change it), or set by a one-off bootstrap route guarded by `BOOTSTRAP_SECRET` and then removed.

### 7.3 Authorization

| Role | Can do |
|---|---|
| `Patient` | read/write own profile, own appointments, own files, submit testimonial (moderated), own billing |
| `Page Editor` | content tabs only (pages, sections, services, news) — no users, no files, no audit |
| `Admin` | content + inquiries + testimonials + appointments + queue + billing + shifts + files |
| `Super Admin` | everything, including users, settings, audit log, backups |

Enforced **twice**: in the Route Handler (role check) **and** at the data boundary (`WHERE cn = session.cn` for patient queries). Sheets has no RLS, so the API is the only guard — there is no generic read endpoint that could leak a table.

### 7.4 Audit log

Appended for every mutation and every auth event: `{ actor_id, actor_role, action, entity, entity_id, meta_json, ip_hash, created_at }`. Read-only for `Super Admin`; there is no delete action.

### 7.5 Input handling

- `zod` schema per action, applied server-side. Reject unknown keys.
- Strip control characters; cap lengths (message 4000, name 120, body 20000).
- No raw HTML rendering anywhere. Content fields render as text; paragraphs split on `\n`.
- File uploads: whitelist `application/pdf`, `image/png`, `image/jpeg`, `image/webp`; max 5 MB; verify magic bytes, not just the extension; recompute `checksum_sha256`.
- Error responses are generic (`{"error":"Something went wrong"}`); details go to `console.error` server-side only.

### 7.6 Lockout / anti-spam

- 5 failed attempts for a `cn` → `locked_until = now + 15 min` (stored in the Sheet, so it holds across serverless instances).
- Per-IP counter in `LoginAttempts` (hashed IP) → 20 failures/hour → temporary block.
- OTP: 5 attempts, single use, 10 min expiry, invalidated on password change.
- **Upgrade path if abuse appears:** swap the counter store to Upstash Redis (free tier) behind `lib/security/rate-limit.ts`; no UI or schema change needed.

### 7.7 Files (Telegram)

Upload: staff/admin → validate → AES-256-GCM encrypt with `FILE_ENCRYPTION_KEY` (random 12-byte IV per file, store `iv` + `authTag` alongside `checksum` in `Files`) → `sendDocument` to the **private** `TELEGRAM_CHAT_ID` → store `telegram_file_id`, never the download URL.

Download: `GET /api/files/:id/download` → session required → authz (`patient_cn === session.cn` or staff role) → sign a 60-second token → server calls `getFile`, downloads from `api.telegram.org/file/bot<token>/...`, decrypts in memory, streams with `Content-Disposition: inline`, `Cache-Control: private, no-store`. The Telegram URL and bot token never reach the client.

### 7.8 Mandatory security checklist → where it is satisfied

| Requirement | Implementation |
|---|---|
| Hide API keys, never in code | Vercel env + Apps Script Script Properties; `.gitignore` covers `.env` |
| Lock admin with RBAC | §7.3, enforced in middleware + Route Handlers |
| Users see only their own data | Server-side `cn` scoping on every patient query |
| Anti-spam login | §7.6 lockout + OTP + per-IP hashed counters |
| Hash all passwords | bcryptjs cost 12 (§7.2) |
| Daily backups | `backup()` trigger, 30-day retention (§6.5) |
| No secrets on GitHub | Rule 4 in §1 |
| OTP/password login flow | §7.1 |
| Validate/sanitise inputs | zod + length caps + magic-byte checks (§7.5) |
| HTTPS everywhere | Vercel default + HSTS in Phase 8 |
| Lock the database | Sheet stays private (no "anyone with link"), `.gs` gated by HMAC |
| Keep packages updated | `npm audit` in Phase 8 |
| Hide error details | Generic client errors (§7.5) |
| Remove unused code | Delete superseded scaffolding (§2.2) |
| Debug off in production | No `console.log` of payloads; `NODE_ENV` guards |

---

## 8. Content model (CMS ↔ public site)

Each public section maps to one `Sections` row keyed by `page_slug` + `section_key`:

| Page | section_key | Component | Editable fields |
|---|---|---|---|
| `/` | `hero` | `components/sections/herosection.tsx` | eyebrow, heading, emphasis, body, cta_label, cta_href, image_url, image_alt |
| `/` | `stats` | same file | 4 label/value pairs (stored as JSON in `body`) |
| `/` | `services_intro` | `servicessection.tsx` | eyebrow, heading, body |
| `/` | `about` | `aboutsection.tsx` | eyebrow, heading, body, 2 stat pairs |
| `/` | `process` | `processsection.tsx` | 3 steps (JSON in `body`) |
| `/` | `testimonials` | `testimonialssection.tsx` | heading only; quotes come from approved `Testimonials` |
| `/` | `news` | `newsection.tsx` | heading; cards come from `News` |
| `/` | `cta` | `ctasection.tsx` | heading, body, buttons |
| `/about`, `/services`, `/news`, `/contact` | `header` | `pageheader.tsx` | eyebrow, title, emphasis, lead |
| all pages | — | `metadata` | meta_title, meta_description, h1, og_image from `Pages` |

Rules:
- `lib/content.ts` reads `public.getContent`, validates with zod, and **merges over the in-file defaults**. Missing/invalid → default wins. This is the anti-regression mechanism; keep it.
- Empty-string fields fall back to defaults (so a half-filled CMS never shows blanks).
- Testimonials/News render **only** `published`/`Approved` rows, capped, newest first.
- Admin publish calls `POST /api/revalidate` (guarded by `REVALIDATE_SECRET`) → `revalidateTag('content')` + `revalidatePath` for affected pages.

---

## 9. Phases

Each phase ends with: build passing, preview healthy, public pages visually identical, and an entry in §16.

### Phase 0 — Contract & safety ✅
- [x] `git tag v1.0-design` on the shipped design (commit `37b6353`)
- [x] `google-apps-script/Code.gs` + `appsscript.json` + `README.md` (no secrets; reads from Script Properties)
- [x] `setup_()`, `health_()`, `backup()`, `applyHeader_`/`migrateHeader_`, HMAC verify, RPC router, error envelope, `withLock_`
- [x] `lib/sheets/client.ts` — signed fetch, 8 s timeout, 3 attempts with backoff, typed `SheetsError`, `isSheetsConfigured()`, `getSystemHealth()`
- [x] `lib/sheets/canonical.ts` — serializer mirrored in `Code.gs`
- [x] `lib/sheets/types.ts` — zod schemas for every tab (Phase 1+ consumers)
- [x] `env.example` with key **names** only (a dot-prefixed `.env.example` is blocked by the workspace tooling)
- [x] `zod` installed (`^3.25`)
- [x] Delete nothing yet; no UI change
- **Verified:** `npm run build` passes (14 routes, public pages still 2 kB first-load); the new modules pass a strict standalone `tsc` run; `node --check` on `Code.gs` is clean.
- **Accept (user side):** deploy the `.gs`, run setup, confirm 18 tabs exist and `system.health` answers over HTTP.### Phase 1 — Auth & roles

- [ ] Replace `lib/auth.ts` + delete `lib/useAuth.ts`; add `lib/auth/{session,password,otp,guards}.ts`
- [ ] Routes: `POST /api/auth/login`, `/verify-otp`, `/logout`, `GET /api/auth/me`, `POST /api/auth/change-password`
- [ ] bcryptjs + jose + zod installed; session cookie; `ver` invalidation
- [ ] Rewrite `middleware.ts`: typed, correct public/private splits (`/admin/login` public, `/portal/login` public, `/portal/dashboard` patient, `/admin/*` staff), redirect with `?next=`
- [ ] Lockout + `LoginAttempts` + `AuditLog` writes
- [ ] `/admin/login` and `/portal/login` pages in brand style (these are *new* files; they do not touch public chrome)
- **Accept:** wrong password 5× locks the CN; correct credentials need the email OTP; a patient JWT gets 403 on `/admin/*`; expired/forged JWT redirects to login; audit rows appear.

Status this resume: session stub (`jwt.ts`/`session.ts`) added to unblock builds; login actions import from `session.ts`; auth API routes/stub modules still need the real implementations before this phase is accepted.

### Phase 2 — Content layer
- [ ] Seed `Pages`/`Sections`/`Services`/`News` from the current hardcoded copy (script, not by hand)
- [ ] `lib/content.ts` with defaults + zod merge
- [ ] Convert the 5 public pages + 9 sections to read from it (markup untouched)
- [ ] `POST /api/revalidate`; ISR (`revalidate = 3600` as a safety net)
- **Accept:** with Sheets empty → pixel-identical to v1.0-design; with published edits → text changes within ~2 s; build output has no per-request Sheet calls on public routes.### Phase 3 — Admin dashboard

- [ ] `app/(admin)/layout.tsx`: collapsible sidebar (drawer <lg), top bar, brand tokens, no public header/footer
- [ ] Content editor: fields per §8, image upload, alt-text required, meta/H1/og fields, draft/publish, section reorder
- [ ] Users (roles, activate/deactivate, reset password, force change), Inquiries inbox, Testimonials moderation
- [ ] Analytics: real aggregates from `analytics.summary` (patient count, appointments trend, ratings, queue throughput) — inline SVG bars, no chart dependency
- [ ] Settings (hotline, address, hours, map coords, social links, GSC, disclaimer, consent version)
- [ ] Audit log (Super Admin only), Backup button
- **Accept:** a Page Editor cannot open Users/Settings; creating a news post publishes it to `/news`; mobile 360px has no horizontal scroll.

Status this resume: admin pages (`page.tsx`, `settings`, `operations`, `user-management`, `audit`, `content`, `files-page`) and admin actions/ui/layout/nav created; build is not green yet because several auth/lib stubs and public/layout/seo imports still need real exports.### Phase 4 — Patient portal

- [ ] `app/(portal)/layout.tsx` mobile-first; dashboard with 2-column desktop grid
- [ ] Appointments: book, reschedule, cancel, reminder status
- [ ] Lab results list + `/api/files/[id]/download` (signed 60 s token, decrypt, stream)
- [ ] Testimonial submission (tied to CN, `Pending`)
- [ ] Emergency hotline `tel:` button from `Settings.hotline`; map shortcut
- [ ] Consent capture on first login → `Consents`
- **Accept:** patient A cannot fetch patient B's PDF (403, audited); expired token fails; no Telegram/bot token in any client bundle.

Status this resume: portal routes/pages/actions + portal API endpoints + portal shared UI created; real Apps Script action names still need the backend side + `lib/sheets/client.ts` support.

### Phase 5 — Files & uploads
- [ ] `lib/files/telegram.ts`: upload (encrypt → `sendDocument`), download (`getFile` → decrypt)
- [ ] Staff upload UI → CN mapping → `Files` row; release-to-patient action
- [ ] `POST /api/upload/image` for CMS images (compressed via `sharp`, stored the same way)
- **Accept:** 5 MB cap enforced, non-PDF rejected, checksum verified on download, ciphertext only in Telegram.

### Phase 6 — Operations
- [ ] Queue board (Waiting/Ongoing/Completed, positions, staff view)
- [ ] Billing records (create, mark paid) + patient view
- [ ] Staff shifts (assign, week view)
- [ ] Reminders: Vercel cron → appointments in 24 h & 2 h → Resend, idempotent via `reminder_sent_at`
- **Accept:** reminders never send twice; queue reorder persists; no PHI in email bodies beyond date/time/clinic.### Phase 7 — SEO & legal

- [ ] `app/sitemap.ts`, `app/robots.ts`, per-page canonical (`alternates.canonical`)
- [ ] JSON-LD `MedicalClinic` + `WebSite` + `BreadcrumbList`
- [ ] One `<h1>` per page; heading-order audit; alt text required by the CMS; internal-link pass
- [ ] `og:image` per page (generate branded SVGs like `public/og-home.svg`); `twitter` card metadata
- [ ] GSC verification via `Settings.gsc_verification`
- [ ] `app/llms.txt/route.ts` (the original brief said "lms.txt"; the correct convention is `llms.txt`)
- [ ] `/privacy`, `/terms`, consent UI, footer legal disclaimer + social icons from `Settings`
- [ ] Fix `lib/seo.ts` or delete it in favour of `generateMetadata` per page
- **Accept:** all 20 checks either pass or are explicitly reported as requiring a user account (GSC, analytics).

Status this resume: sitemap/robots/llms.txt/privacy/terms/error/not-found started; public pages were rewritten to use `@/lib/content` + `pageMeta`/`getSiteContent` + `seoMeta`; public layouts import `components/layout/header` + `components/layout/footer` which still need correct barrel exports.### Phase 8 — Hardening & cleanup

- [ ] Remove `typescript.ignoreBuildErrors` / `eslint.ignoreDuringBuilds`; fix every real error
- [ ] Security headers + CSP + HSTS in `next.config.js`; `poweredByHeader: false`
- [ ] Generic `error.tsx` / `not-found.tsx`; no stack traces to users
- [ ] `npm audit`; remove unused deps (daisyUI, unused SVGs, stale scratch files, `REMAINING_TASKS.md`)
- [ ] WCAG pass: labels, `aria-live` for form errors, focus rings, contrast ≥ 4.5:1, skip link
- [ ] Failed-login alert email to admin; daily backup verification
- [ ] `docs/RUNBOOK.md`: backup/restore, secret rotation, disaster recovery, incident steps
- **Accept:** production build with type checking on; zero critical/high audit findings; restore rehearsed from a backup copy.

Status this resume: `next.config.js` already had `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` removed; ESLint config is currently a separate blocker because it references an uninstalled `@typescript-eslint` plugin, so the build will not be green until that config is fixed.

### Phase 9 (optional) — EN/TL toggle
Only if the user asks. Dictionary-based, cookie-persisted, no route duplication.

---

## 10. Environment variables

| Key | Where | Notes |
|---|---|---|
| `GS_WEBAPP_URL` | Vercel | Apps Script `/exec` URL |
| `GS_SHARED_SECRET` | Vercel + Script Properties | 64-char random; same value both sides |
| `HASH_PEPPER` | Vercel + Script Properties | For `ip_hash` / `ua_hash` |
| `SESSION_SECRET` | Vercel | JWT signing (≥ 32 bytes) |
| `FILE_ENCRYPTION_KEY` | Vercel | 32-byte base64 for AES-256-GCM |
| `TELEGRAM_BOT_TOKEN` | Vercel + Script Properties | From @BotFather |
| `TELEGRAM_CHAT_ID` | Vercel + Script Properties | Dedicated **private** channel/group |
| `RESEND_API_KEY` | Vercel | OTP + reminders |
| `MAIL_FROM` | Vercel | Verified sender |
| `ADMIN_ALERT_EMAIL` | Vercel | Failed-login / error alerts |
| `REVALIDATE_SECRET` | Vercel | Admin publish → cache refresh |
| `NEXT_PUBLIC_SITE_URL` | Vercel | Canonical/sitemap base (`https://<domain>`) |

`env.example` lists names only. The sandbox `.env` / `.env.local` are injected automatically — never read, print, or commit them.

---

## 11. Repo layout (target)

```
app/
  (public)/            # current 5 pages, unchanged markup
  (admin)/admin/       # dashboard, own layout
  (portal)/portal/     # patient portal, own layout
  api/auth/            # login, verify-otp, logout, me, change-password
  api/content/         # admin CRUD proxies (authz + zod)
  api/files/           # upload, [id]/download
  api/revalidate/
  sitemap.ts  robots.ts  llms.txt/route.ts
components/
  layout/  sections/  ui/   # existing, frozen
  admin/  portal/           # new, brand-themed
lib/
  sheets/client.ts  sheets/types.ts
  content.ts  auth/  files/  security/  mail/
google-apps-script/
  Code.gs  appsscript.json  README.md
docs/
  BUILD_PLAN.md (this file)  RUNBOOK.md
env.example            # template, no values
```

---

## 12. Installed dependencies (planned)

| Package | Why |
|---|---|
| `bcryptjs` | password hashing (pure JS, Vercel-safe) |
| `jose` | JWT sign/verify (edge-compatible for middleware) |
| `zod` | input + content validation (installed in Phase 0) |
| `sharp` | image compression before Telegram upload (Next already ships it) |

No chart library, no UI kit, no ORM — the site's hand-built primitives are sufficient and keep the bundle small.

---

## 13. Verification protocol

```bash
npm run build                                   # must pass, all routes
freebuff-preview restart                        # own command, never chained
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/ /about /services /news /contact
```

- Public pages must stay **visually identical** to `v1.0-design` (compare markup/structure; this sandbox cannot render images, so rely on DOM/class diffs and the user's own visual check).
- Security spot checks per phase: unauthenticated `/admin` → redirect; patient JWT on `/admin` → 403; patient A's file id with patient B's session → 403; missing `x-signature` → denied; replayed nonce → denied.
- Never report a check as passing unless the command actually ran and exited 0.

---

## 14. Landmines (learned the hard way)

1. **`buttonClasses` must stay in `button-styles.ts`** (client-free). Moving it into `components/ui/button.tsx` breaks server-component prerendering.
2. **`next.config.js` currently ignores TS/ESLint errors** — do not treat a green build as proof of type safety until Phase 8. Run `npx tsc --noEmit` with `lib/auth.ts` excluded to see the real state (it is truncated and always fails).
3. **Apps Script always returns 200.** Never branch on `res.ok` alone; check the `ok` field in the JSON body.
4. **Don't send custom headers from the browser** to Apps Script (CORS preflight is unanswerable). All calls are server-side, so this only matters if someone "simplifies" it later.
5. **Sheets has no transactions.** Any write without `LockService` can lose rows when two admins save at once.
6. **DaisyUI is disabled** (`base:false`, `styled:false`). Do not reintroduce its classes; nothing styles them now.
7. **No image viewer in this sandbox** — `read_files` cannot display images. Do not claim visual verification of a screenshot.
8. **Logo path is `/SBDC.png`** (no `logo.svg`); older notes referencing `/logo.svg` are obsolete.
9. **The redesign deliberately has no stock photos.** Do not add Unsplash/Pexels URLs; the earlier attempt was blocked and unverifiable.
10. **`REMAINING_TASKS.md` is stale** — it predates the redesign. `docs/BUILD_PLAN.md` supersedes it.

---

## 15. Open items for the user

- Spreadsheet ID + deployed `/exec` URL, Telegram bot token + private chat ID, Resend key.
- Real content: services list, address, hotline, office hours, social URLs, one sample lab PDF.
- Legal review of the drafted Privacy Policy / Terms (RA 10173 / RA 8792) — the assistant can draft, not certify.
- Confirm whether the admin should also see a staff-facing queue screen on a tablet at the front desk.

---

## 16. Change log

| Date | Change |
|---|---|
| 2026-10-30 | v1.0 — plan documented before any backend work; design frozen at `v1.0-design`; architecture decided (Sheets + Apps Script + Telegram + Resend). |
| 2026-10-30 | v1.1 — Phase 0 shipped (tag, `.gs` with 18-tab auto-setup, signed client, zod types, `env.example`). Corrected the auth transport in §6.2: Apps Script cannot read custom headers, so the HMAC signature moved into the request body. |
