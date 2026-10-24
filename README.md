# GharSe

From home kitchen to store shelf. A Hindi-first AI agent that turns a home food
maker's recipe into a sellable, compliant product: costing, a draft FSSAI-format
label, batch records, a registration checklist and a marketplace listing pack.

Tech4Bharat, GAVS 2026, Agentic AI track, problem 6.3.

## Status

Paused partway through **phase 1** (scaffold, data model, channel adapter, chat
simulator, mock mode). See [TODO.md](TODO.md) for exactly what is done and what is next.

## Run it locally

```bash
npm install
cp .env.example .env      # works as is: missing keys mean mock mode
npm run setup             # create the SQLite db and seed the demo data
npm run dev               # http://localhost:3000
```

Open <http://localhost:3000/demo> to reset the demo data and log in as the demo
seller. The app is built for phones: use a 360 px wide window.

| Command | What it does |
|---|---|
| `npm test` | Unit and integration tests (uses a throwaway `prisma/test.db`) |
| `npm run typecheck` | TypeScript check |
| `npm run db:reset` | Delete the local db and re-seed |
| `npm run schema:postgres` | Generate the Postgres schema for Supabase |

## Mock mode

Every external service sits behind an interface. If its key is missing (or
`MOCK_MODE=1`), a realistic mock runs instead, so the whole demo works offline.
The chat header shows a "demo mode" chip listing which services are mocked.

| Service | Key | Mock behaviour |
|---|---|---|
| LLM (Anthropic) | `ANTHROPIC_API_KEY` | Phase 3 |
| Speech to text (Sarvam) | `SARVAM_API_KEY` | Any voice note is heard as a fixed lime-pickle recipe |
| Text to speech (Sarvam) | `SARVAM_API_KEY` | Text replies only |
| Nutrition fallback (USDA) | `USDA_FDC_API_KEY` | Phase 2 |
| WhatsApp Cloud API | `CHANNEL_WHATSAPP=1` + `WHATSAPP_*` | Off; the web simulator is used |

## Layout

```
prisma/schema.prisma    data model (SQLite source; Postgres generated from it)
src/channels/           channel adapter interface, simulator, WhatsApp stub, router
src/agent/              agent (phase 1 placeholder) and decision log
src/services/speech/    speech-to-text / text-to-speech interfaces and mocks
src/lib/                config, db, session, storage, i18n (hi + en), demo seed
src/app/                login, chat simulator, dashboard, /demo, API routes
tests/                  vitest
```
