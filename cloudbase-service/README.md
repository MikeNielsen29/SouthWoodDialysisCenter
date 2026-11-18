# CloudBase DB — service API

Ang backend ng site. Ang CloudBase DB ang database, at ang service na ito ang nagiging JSON API niya para sa Next.js server. **Hindi ito kinakausap ng browser.**

## One-time setup (mga 2 minuto)

1. Buksan ang CloudBase service editor at gumawa ng bagong project, tapos i-paste ang buong `Code.gs` → **Save**
2. Piliin ang function na **`initialize`** sa dropdown → **Run** → payagan ang mga permission
3. **Deploy → New deployment → Web app** (*Execute as: Me*, *Access: Anyone*) → kopyahin ang `/exec` URL
4. Sa hosting env: `GS_WEBAPP_URL` = ang URL, `GS_SHARED_SECRET` = random key → **Redeploy**

Hindi mo kailangang mag-set ng anumang database ID — ang service mismo ang hahanap (o gagawa) ng **CloudBase DB**.

## Manual na setup

1. Gumawa ng blangkong database na pinangalanang `CloudBase DB`.
2. Buksan ang service editor mula sa database.
3. Kopyahin ang buong laman ng `Code.gs` dito sa editor.
4. **Project Settings → Show "appsscript.json"** → i-paste ang `appsscript.json` ng folder na ito.
5. **Project Settings → Script Properties → Add script property** (lahat kailangan):
   - `GS_SHARED_SECRET` — 64 random characters (`openssl rand -hex 32`)
   - `HASH_PEPPER` — isa pang 64 random characters
   - `TELEGRAM_BOT_TOKEN` — token ng Media Vault
   - `TELEGRAM_CHAT_ID` — channel/chat ID ng Media Vault
6. **Deploy → New deployment → Web app**
   - Description: `API v1`
   - **Execute as: Me**
   - **Who has access: Anyone** ← kailangan para makatawag ang hosting; ang totoong proteksyon ay ang access key
7. Kopyahin ang **Web app URL** (nagtatapos sa `/exec`) → ilagay sa hosting env bilang `GS_WEBAPP_URL`.
8. Bumalik sa database, i-reload. Lalabas ang menu **CloudBase DB** → **Run setup / migrate**.

Pagkatapos ng setup, 18 tables na ang nasa database, may headers, frozen row, dropdown validation, at naka-protect na hash columns. **Huwag mo nang kailangang mag-type doon** — ang admin dashboard na ang magsusulat.

## Menu

| Item | Ginagawa |
|---|---|
| Run setup / migrate | Gumagawa ng kulang na tables/columns. Hindi kailanman binubura ang data. Safe i-run kahit ilang beses. |
| Health check | Table names, row counts, schema version, kung may naka-set na secrets, at last backup. |
| Backup now | Kopya ng buong database sa backup vault. May automatic daily trigger (2 AM, Asia/Manila) at 30-day retention. |

## Paano tinatawag ang backend

Ang service ay "Anyone with access" dahil kailangan itong tawagan ng hosting. Ang action at key ay nasa query string:

```
POST <exec-url>?action=<action>&key=<GS_SHARED_SECRET>
Body: { ...payload }
```

- **`auth.login`** at **`system.health`** ay **public** — walang key. Ang password ay vine-verify ng service mismo, kaya hindi ka makakalock out kahit mali ang key.
- Lahat ng ibang action ay nangangailangan ng `key` na kapareho ng `GS_SHARED_SECRET` sa Script Properties.
- Password hash: `sha256$<salt>$<hex>` na may 500 rounds, sinusulat at vine-verify rito.

## Default administrator

Ang **Run setup / migrate** ay gumagawa ng isang admin **kung blangko pa ang Users tab**:

- Control number: `SDC-ADMIN`
- Email: `admin@southwooddialysis.com`
- Password: `Southwood2026!` — **palitan agad** pagkatapos ng unang sign-in.

## Troubleshooting

| Sintomas | Solusyon |
|---|---|
| `NOT_CONFIGURED` | Wala pang `GS_SHARED_SECRET` sa Script Properties, o hindi pa nag-rurun ng setup |
| `UNAUTHORIZED` | Hindi tugma ang `GS_SHARED_SECRET` sa hosting at sa Script Properties |
| `UNKNOWN_ACTION` | Wala pang implementation ang aksyon |
| Bagong code hindi gumagana | **Deploy → Manage deployments → Edit → New version**, tapos Deploy. Hindi sapat ang Save. |

## Security notes

- Walang secret sa repo. Nasa Script Properties lang.
- Ang database ay dapat **private**.
- Kung na-leak ang URL: palitan ang `GS_SHARED_SECRET` sa dalawang lugar (Script Properties + hosting), redeploy.
- Ang backup ay nasa clinic account — hindi kasama sa repo.
