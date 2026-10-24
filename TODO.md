# TODO

## Where we stopped (24 Oct 2026)

Paused partway through phase 1, to resume when the prototype window opens (23 Nov).

**Done in phase 1**
- Next.js 15 + TypeScript + Tailwind 4 + Prisma 6 scaffold, SQLite locally,
  Postgres schema generator for Supabase.
- Full data model: seller, product, recipe versions, ingredients, prices,
  costing (with sign-off), label (draft until checked), batch, registration
  checklist, listing pack, messages, decision log, nudges, and placeholder
  stakeholders (testing lab + referrals, buyers, packaging suppliers, food
  safety officer).
- Channel adapter interface; web simulator adapter; WhatsApp adapter stub
  behind `CHANNEL_WHATSAPP`; one router for every inbound message.
- WhatsApp-style chat simulator at 360 px: text, quick-reply buttons, photo
  upload with in-browser compression, voice notes (24 kbps opus) with
  playback, optimistic send with retry, slow polling while visible.
- Hindi-first UI with English toggle (typed dictionaries).
- Mock speech-to-text; phase 1 placeholder agent that writes to the decision log.
- Phone-number login (signed cookie), `/demo` reset route, basic dashboard.
- Demo seed: Sunita Sharma, Ghaziabad, with Aam ka Achaar (400 g jar) and
  Besan Ladoo (250 g box, deliberately priced at Rs 100 for the below-cost warning).
- 27 passing tests; typecheck and production build pass.

**Left to finish phase 1**
- [ ] Review the 360 px Playwright screenshots (taken, not yet reviewed) and fix
      any layout issues. The scripted flow worked end to end: login validation,
      /demo, text, voice note with transcript reply, photo, demo-mode panel,
      English toggle, dashboard, no horizontal scroll.
- [ ] Confirm the photo upload is actually compressed (the test hook could not
      read multipart bodies; measure the stored file size instead).
- [ ] Merge `phase-1-wip` into `main` as the phase 1 checkpoint.

## Next phases
2. Deterministic core: units (incl. katori, mutthi, chammach), costing,
   nutrition (IFCT 2017, USDA fallback), batch numbers and dates, rules engine
   over `rules/fssai.yaml`. Move the seed's hard-coded grams onto `src/core/units.ts`.
3. Agent: intake, readiness state, next-step planner, follow-ups, decision trail.
4. Outputs: label PDF/PNG, registration checklist, listing pack.
5. Sarvam speech, WhatsApp adapter.
6. Dashboard, demo script, polish.

## Open questions
- FSSAI 2026 thresholds (Basic Registration up to Rs 1.5 crore, State Licence
  Rs 1.5 to 50 crore, Central above Rs 50 crore, perpetual validity) come from
  secondary reports of the FSSAI implementation order of 13 March 2026. Mark them
  `needs_verification` in `rules/fssai.yaml` until the official order is found.
- fssai.gov.in is blocked by this environment's network policy; verify rules
  through other official copies or from a normal browser.
- Phone login has no OTP (prototype only).
- Media is stored on local disk. Render/Railway disks are ephemeral, so move to
  Supabase Storage before the hosted demo.
