# career-ops Dashboard

## What This Is

SaaS web dashboard for AI-powered job search, built on Next.js 15 + Supabase + Stripe. Multi-user product with free tier (5 evals/mo) and Pro tier ($12/mo). Core pipeline: paste job URL → AI evaluation → score + gap analysis → CV generation → application tracking. BYOK (Bring Your Own Key) unlocks unlimited evals on Pro. Y2K maximalist design. Deployable to Vercel as `career-ops.app`.

## Core Value

**Open dashboard each morning and immediately know: who needs a follow-up today, which top-5 listings to apply to next, and where overall progress stands** — without grep, without context-switching across reports/output/pipeline files.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] REQ-FND-01: Next.js 15 + Tailwind v4 + TypeScript scaffold in `dashboard/web/` (does not break santifer update path)
- [ ] REQ-FND-02: DESIGN.md Y2K tokens wired into Tailwind config (Bricolage Grotesque + General Sans + IBM Plex Mono + cream paper bg + triple-neon accent)
- [ ] REQ-FND-03: Vitest + Playwright + `test-all.mjs --dashboard` target integrated
- [ ] REQ-DAT-01: Parse `data/applications.md` (81 rows) with Zod schema + per-row error boundary
- [ ] REQ-DAT-02: Parse `data/pipeline.md` (111 rows) with same schema/error pattern
- [ ] REQ-DAT-03: Parse `reports/*.md` (extract A-F sections) + locate companion `output/*.pdf`
- [ ] REQ-DAT-04: `spawn-mjs.ts` uses `child_process.spawn(cmd, [args])` array form; URL validator rejects non-http(s) + shell metacharacters
- [ ] REQ-DAT-05: `git-commit.ts` writes guarded by `proper-lockfile` (stale-lock recovery built in)
- [ ] REQ-API-01: `GET /api/applications` returns parsed applications JSON
- [ ] REQ-API-02: `GET /api/pipeline` returns parsed pipeline JSON
- [ ] REQ-API-03: `GET /api/listing/[id]` returns report MD + PDF path; 404 on missing
- [ ] REQ-API-04: `POST /api/actions/apply` validates URL + spawns gstack browse headed; 400 on invalid URL
- [ ] REQ-API-05: `POST /api/actions/mark-sent` locks MD, updates row, releases lock; 423 on contention
- [ ] REQ-COM-01: magic MCP generates 4 base components into `components/raw/` (StatusBadge, ScoreBar, ListingCard, ProgressMeter); raw stays untouched
- [ ] REQ-COM-02: Motion wrappers in `components/` apply Framer Motion v12 variants from `lib/motion-presets.ts` (fadeUp, scoreCountUp, layoutSpring, chromaticFlash)
- [ ] REQ-PAG-01: `/today` renders ProgressMeter + Follow-ups Today (overdue magenta highlight) + Top 5 to Apply (sorted by score)
- [ ] REQ-PAG-02: `/pipeline` renders sortable/filterable table over 192 rows (filter chips: status, source, score range; search-as-you-type)
- [ ] REQ-PAG-03: Listing modal opens from `/pipeline` row, side-by-side report MD + PDF iframe, action bar with [Open in Chrome] [Mark Applied] [Mark Discarded]
- [ ] REQ-TST-01: 32 unit tests covering parsers (14), spawn (5), lock (4), API routes (5), components (4)
- [ ] REQ-TST-02: 3 Playwright E2E: apply flow, mark-sent locking, malformed MD toast

### Out of Scope (deferred)

- `/stats` charts screen — dead-weight risk admitted in design doc; add only when dashboard becomes daily-driver and stats vacuum is real
- `/follow-ups` dedicated screen — folded into `/today`; separate page deferred
- Auto-commit MD changes after every action — keeps git log noisy; user commits manually via `git diff data/`
- chokidar live-watch on `data/` files — revalidate on user action sufficient; live watch is dev-time nice-to-have
- OS notifications for overdue follow-ups — UI badge only in v1
- macOS LaunchAgent auto-start — manual `npm run dev` in v1
- Auto-submit applications — explicit ethical-use rule in `AGENTS.md`; dashboard opens browser, user submits
- TUI Go bubbletea replacement — TUI stays for SSH workflow; web is additive

## Context

- **Forked repo**: santifer/career-ops, branch `feat/settings-page`. `update-system.mjs` auto-pulls system layer; `dashboard/web/` lives entirely in user layer per `DATA_CONTRACT.md`.
- **Multi-user SaaS**: auth via Supabase (email + Google OAuth). Row-level security. Deployed to Vercel.
- **Existing artifacts to honor**:
  - `dashboard/main.go` + `dashboard/internal/` — Go TUI bubbletea, stays alongside (NOT replaced)
  - `dashboard/index.html` — santifer's static dashboard, untouched
  - `~60 *.mjs` scripts — remain for local CLI workflows; cloud equivalents in Phase 2+
- **Data layer**: Supabase Postgres. Schema in `supabase/migrations/`. NOT MD files.
- **Billing**: Stripe free (5 evals/mo, Haiku) + Pro ($12/mo, 100 hosted Sonnet OR unlimited BYOK).
- **BYOK**: Pro-only. Anthropic API key stored via Supabase Vault (pgsodium). Onboarding + Settings.
- **Stack pre-decided**: Next.js 15 + React 19 + TypeScript strict + Tailwind v4 + Framer Motion v12. Stripe SDK. Supabase JS client.
- **DESIGN.md locked** (Y2K maximalist, light cream + triple neon, Bricolage Grotesque display).
- **Prior planning artifacts**: CEO plan v2 + eng review in `~/.gstack/projects/santifer-career-ops/`.

## Constraints

- **Tech stack**: Locked to Next.js 15 + React 19 + Tailwind v4 + Framer Motion v12 — no substitutions without explicit re-review.
- **File layout**: `dashboard/web/` only — must not touch santifer system layer (`update-system.mjs`, `templates/`, `modes/`, etc.) per `DATA_CONTRACT.md`.
- **Data layer**: Supabase Postgres. MD/TSV are no longer source of truth for the web app. Local CLI scripts still use MD directly.
- **Security**: Stripe webhook signature verification mandatory (`constructEvent(rawBody, sig, secret)`). Vault RPCs server-side only. `spawn` array form mandatory. No auto-submit.
- **Billing**: eval gate uses atomic `UPDATE ... WHERE eval_count < limit RETURNING` (no TOCTOU race). Stripe `trial_period_days: 7` on checkout.
- **Distribution**: Vercel deployment (`career-ops.app`). Stripe webhook registered at production URL.
- **Update compatibility**: santifer `update-system.mjs check` must continue to pass — no edits to system-layer files.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Y2K maximalist aesthetic | Portfolio-piece value + interview talking point; warm cream bg keeps daily-use anxiety low | ACCEPTED |
| Wrapper pattern (`components/raw/` + `components/`) | Magic MCP regenerates won't overwrite custom motion code | ACCEPTED |
| Vitest + Playwright (not Jest) | Next.js 15 native, ESM-first; Playwright in gstack ecosystem | ACCEPTED |
| Supabase over MD/TSV as data layer | SaaS requires multi-user, auth, RLS — MD files cannot support this | ACCEPTED 2026-05-22 |
| Free tier: 5 evals/mo (not 10) | Faster conversion clock — user hits limit in first week of active search | ACCEPTED 2026-05-22 |
| Pro tier: $12/mo (not $9) | 33% above $9 cluster; signals premium; still 3x cheaper than LinkedIn Premium | ACCEPTED 2026-05-22 |
| BYOK: Pro-only, via Supabase Vault | Gates upgrade incentive; Vault (pgsodium) for secure key storage | ACCEPTED 2026-05-22 |
| Atomic eval gate: `UPDATE...WHERE count<limit RETURNING` | Prevents TOCTOU race on concurrent requests; one DB call closes the window | ACCEPTED 2026-05-22 |
| Stripe webhook: signature verify mandatory | `constructEvent()` required — unauthenticated webhook = free Pro exploit | ACCEPTED 2026-05-22 |
| Optimistic `is_pro=true` on checkout redirect | Webhook fires after redirect — optimistic grant + idempotent webhook = standard Stripe pattern | ACCEPTED 2026-05-22 |
| BYOK inline error (not toast) | User must connect error to key field; toast too generic for validation | ACCEPTED 2026-05-22 |
| 7-day free trial at eval #5 | Removes "I don't know if it's worth $12" objection at peak urgency moment | ACCEPTED 2026-05-22 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-22 — SaaS architecture pivot after /plan-ceo-review + /plan-eng-review. CEO plan: `~/.gstack/projects/santifer-career-ops/ceo-plans/2026-05-22-pricing-model-v2.md`*
