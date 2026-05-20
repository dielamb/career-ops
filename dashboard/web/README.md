# career-ops Dashboard — Web (Next.js)

Local web dashboard for the career-ops AI job-search pipeline.

See `/.planning/` at repo root for full project context, requirements, and phase plans.
See `/DESIGN.md` for the Y2K maximalist design system.

## Local dev

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Layout

- `app/` — Next.js 15 App Router pages and layouts
- `components/` — Motion-wrapped components (Phase 4)
- `components/raw/` — Magic MCP base components (Phase 4)
- `lib/` — Parsers, schemas, spawn, lock helpers (Phase 2)
- `tests/` — Vitest unit tests
- `e2e/` — Playwright end-to-end tests

## Constraints

- Scoped strictly to `dashboard/web/` per `/DATA_CONTRACT.md`.
- santifer system layer (`update-system.mjs`, `modes/`, `templates/`) must remain untouched.
