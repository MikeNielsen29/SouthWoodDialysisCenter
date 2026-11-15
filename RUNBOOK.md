# Southwood Dialysis Center — Runbook

## What this is

Next.js 14.2 (App Router) site for Southwood Dialysis Center, served on Vercel.

- Public site routes live under `app/(site)/`.
- Admin routes live under `app/(admin)/admin/`.
- Patient portal routes live under `app/(portal)/portal/`.
- API routes live under `app/api/`.

## Stack

- Next.js 14.2.4
- React 18
- TypeScript
- Tailwind 3.4 with custom `brand`/`sand`/`ember`/`ink` tokens
- Google Sheets backend via a Google Apps Script Web App
- Telegram Bot for file storage
- Resend for email OTP and reminders
- Edge JWT auth via `jose`, with bcryptjs for password hashes

## Environment variables

Required before auth or live content works:

- `GS_WEBAPP_URL`
- `GS_SHARED_SECRET`
- `HASH_PEPPER`
- `FILE_ENCRYPTION_KEY`
- `RESEND_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `SETUP_TOKEN` (optional)

A starter template exists in `env.example`. Copy it to `.env.local` and fill in real values.

```
cp env.example .env.local
```

## Public site

- Routes: `/`, `/about`, `/services`, `/news`, `/contact`
- Legal pages: `/privacy-policy`, `/terms-of-service`
- SEO helpers: `app/sitemap.ts`, `app/robots.ts`, `app/llms.txt/route.ts`
- Content falls back to shipped copy when Sheets is empty or unavailable.

## Admin

- Entrypoint: `/admin`
- Pages: overview, content, services, news, inquiries, testimonials, audit, settings, user-management, operations, files
- Protected by middleware and `requireRole`.

## Patient portal

- Entrypoint: `/portal`
- Protected by `requireUser` in the portal layout.
- Pages: dashboard, appointments, files, testimonials, privacy notice
- File downloads go through `app/api/portal/files/[id]/route.ts`.

## Build

```
npm run build
```

Before build, verify TypeScript and lint pass locally:

```
bun tsc -b --noEmit
```

## Deploy

Use the project’s deploy workflow on Vercel. Env vars for production are set separately from `.env.local`.

## Backend: Google Sheets

- All external calls are server-side only.
- The Apps Script URL and shared secret are never exposed to the browser.
- The backend always returns HTTP 200; success is determined by the `ok` field in the JSON response.

## Files and encryption

- Files are stored through the Telegram Bot integration.
- Sensitive file content is encrypted before upload and decrypted on download.
- File access in the portal is account-scoped and logged.

## Auth

- Email OTP is the normal auth path.
- Passwords are hashed with bcryptjs and a pepper from `HASH_PEPPER`.
- JWT sessions are issued edge-side with `jose`.
- Dev-only bypass code: `000000`, used only when not in production and no Resend key is configured.

## Reset flows

- Password resets send an OTP to the user’s email.
- Admins can reset passwords and manage accounts from user-management.
- OTP and reminder emails are sent through Resend.

## Common operational tasks

- Edit public content: `/admin/content`
- Edit services/news/testimonials: their respective admin pages
- Edit clinic settings: `/admin/settings`
- Manage users: `/admin/user-management`
- Daily operations: `/admin/operations`
- Audit: `/admin/audit`

## Security notes

- Do not add secrets to the repo.
- Do not import server-only modules in client components.
- Do not let the browser see the Apps Script URL, shared secret, Telegram token, or spreadsheet ID.
- Keep middleware matchers aligned with protected routes.

## If the backend is unavailable

- The public site continues to render from shipped defaults.
- Admin actions that require Sheets will show a “not configured” or similar error.
- Portal file downloads will not work until Sheets and Telegram are configured.

## Support notes

- If a user cannot sign in, confirm the email on file before resetting.
- If a patient file download fails, check file release status and Telegram configuration.
- If auth is broken in development, check `HASH_PEPPER` and `RESEND_API_KEY`.
