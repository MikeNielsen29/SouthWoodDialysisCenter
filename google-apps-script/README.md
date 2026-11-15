# CloudBase DB — Apps Script API

Ang backend ng site. Google Sheets ang database, at ang script na ito ang nagiging JSON API niya para sa Next.js server. **Hindi ito kinakausap ng browser.**

## One-time setup (mga 2 minuto)

**Galing sa editor (pinakasimple):**

1. `script.google.com` → **New project** (hindi na kailangang bound sa sheet) → i-paste ang buong `Code.gs` → **Save**
2. Piliin ang function na **`initialize`** sa dropdown → **Run** → payagan ang mga permission
3. **Deploy → New deployment → Web app** (*Execute as: Me*, *Access: Anyone*) → kopyahin ang `/exec` URL
4. Sa Vercel: `GS_WEBAPP_URL` = ang URL, `GS_SHARED_SECRET` = random key → **Redeploy**

Hindi mo kailangang mag-set ng anumang sheet ID — hahanapin (o gagawa) ng script ang **CloudBase DB** sa Drive.

## Manual na setup (kung bound project ang gusto mo)

1. Gumawa ng blangkong Google Sheet, pangalanan: `CloudBase DB`.
2. Sa Sheet: **Extensions → Apps Script**.
3. Kopyahin ang buong laman ng `Code.gs` dito sa editor (palitan ang `function myFunction()`).
4. **Project Settings → Show "appsscript.json"** → i-paste ang `appsscript.json` ng folder na ito (ito ang nagse-set ng timezone, scopes, at web app access).
5. **Project Settings → Script Properties → Add script property** (lahat kailangan):
   - `GS_SHARED_SECRET` — 64 random characters (`openssl rand -hex 32`)
   - `HASH_PEPPER` — isa pang 64 random characters
   - `TELEGRAM_BOT_TOKEN` — mula kay @BotFather (Phase 5 pa gagamitin, pero ilagay na)
   - `TELEGRAM_CHAT_ID` — ang private channel/group ID (Phase 5)
6. **Deploy → New deployment → Web app**
   - Description: `API v1`
   - **Execute as: Me**
   - **Who has access: Anyone** ← kailangan ito para makatawag ang Vercel; ang totoong proteksyon ay ang shared secret + HMAC signature
7. Kopyahin ang **Web app URL** (nagtatapos sa `/exec`) → ilagay sa Vercel env bilang `GS_WEBAPP_URL`.
8. Bumalik sa Sheet, i-reload. Lalabas ang menu **CloudBase DB** → **Run setup / migrate**.

Pagkatapos ng setup, 18 tabs na ang nasa spreadsheet, may headers, frozen row, dropdown validation, at naka-protect na hash columns. **Huwag mo nang kailangang mag-type doon** — ang admin dashboard na ang magsusulat.

## Menu

| Item | Ginagawa |
|---|---|
| Run setup / migrate | Gumagawa ng kulang na tabs/columns. Hindi kailanman binubura ang data. Safe i-run kahit ilang beses. |
| Health check | Tab names, row counts, schema version, kung may naka-set na secrets, at last backup. |
| Backup now | Kopya ng buong spreadsheet sa Drive folder `CloudBase DB Backups`. May automatic daily trigger (2 AM, Asia/Manila) at 30-day retention. |

## Paano tinatawag ang backend

Ang web app ay "Anyone with access" dahil kailangan itong tawagan ng Vercel. Ang action at key ay nasa query string, tulad ng LCC Calendar Notebook backend:

```
POST <exec-url>?action=<action>&key=<GS_SHARED_SECRET>
Body: { ...payload }
```

- **`auth.login`** at **`system.health`** ay **public** — walang key. Ang password ay vine-verify ng Apps Script mismo, kaya hindi ka makakalock out kahit mali ang key.
- Lahat ng ibang action ay nangangailangan ng `key` na kapareho ng `GS_SHARED_SECRET` sa Script Properties.
- Password hash: `sha256$<salt>$<hex>` na may 500 rounds, sinusulat at vine-verify rito (hindi kayang mag-bcrypt ang Apps Script).

## Default administrator

Ang **Run setup / migrate** ay gumagawa ng isang admin **kung blangko pa ang Users tab**:

- Control number: `SDC-ADMIN`
- Email: `admin@southwooddialysis.com`
- Password: `Southwood2026!` — **palitan agad** pagkatapos ng unang sign-in (may `must_change_password` na nakatakda).

## Troubleshooting

| Sintomas | Solusyon |
|---|---|
| `NOT_CONFIGURED` | Wala pang `GS_SHARED_SECRET` sa Script Properties, o hindi pa nag-rurun ng setup |
| `UNAUTHORIZED` | Hindi tugma ang `GS_SHARED_SECRET` sa Vercel at sa Script Properties |
| `EXPIRED` | Mali ang oras ng server, o sobrang luma na ang request (check ang system clock) |
| `REPLAY` | Naipadala nang dalawang beses ang parehong nonce — retry lang |
| `UNKNOWN_ACTION` | Wala pang implementation ang aksyon (hal. `public.getContent` bago ang Phase 2) |
| Bagong code hindi gumagana | **Deploy → Manage deployments → Edit → New version**, tapos Deploy. Hindi sapat ang Save. |

## Security notes

- Walang secret sa repo. Nasa Script Properties lang.
- Ang spreadsheet ay dapat **private** (walang "anyone with the link").
- Kung na-leak ang URL: palitan ang `GS_SHARED_SECRET` sa dalawang lugar (Script Properties + Vercel), redeploy.
- Ang daily backup ay nasa Drive ng may-ari — hindi kasama sa repo.
