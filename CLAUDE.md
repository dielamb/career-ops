@AGENTS.md
<!-- Add anything Claude Code specific that other agents don't need -->

## Design System

Always read `DESIGN.md` before making any visual or UI decisions in `dashboard/web/`.
All font choices, colors, spacing, border radii, motion timing, and aesthetic direction are defined there.
Do not deviate without explicit user approval (update DESIGN.md decision log on any change).
In QA / design-review modes, flag any code in `dashboard/web/` that doesn't match `DESIGN.md` tokens.

**Quick reference**:
- Aesthetic: Y2K Maximalist (paper-grounded, neon-action)
- Display font: Bricolage Grotesque (variable wdth)
- Body font: General Sans
- Mono: IBM Plex Mono
- Background: cream `#faf6ee`, ink `#0a0a08`
- Triple accent: cyber `#00d4ff` (action), magenta `#ff006e` (attention), acid `#b8ff00` (success)
- Chrome stays neutral; neon ONLY in status/action surfaces.

<!-- GSD:project-start source:PROJECT.md -->
## Project

**career-ops Dashboard**

Local Next.js web dashboard layered on top of career-ops AI job-search pipeline (santifer fork). Aggregates `data/applications.md` (81 rows), `data/pipeline.md` (111 pending), `reports/*.md` and `output/*.pdf` into a single interactive view with 3 screens (`/today`, `/pipeline`, listing modal). Single-user tool for Michał Maciejewski during active job search; doubles as portfolio piece visible during screen-share interviews.

**Core Value:** **Open dashboard each morning and immediately know: who needs a follow-up today, which top-5 listings to apply to next, and where overall progress stands** — without grep, without context-switching across reports/output/pipeline files.

### Constraints

- **Tech stack**: Locked to Next.js 15 + React 19 + Tailwind v4 + Framer Motion v12 + magic MCP — no substitutions without explicit re-review.
- **File layout**: `dashboard/web/` only — must not touch santifer system layer (`update-system.mjs`, `templates/`, `modes/`, etc.) per `DATA_CONTRACT.md`.
- **Data contract**: MD/TSV remain source of truth; no SQLite/Postgres migration.
- **Security**: `spawn` array form mandatory; URL validator rejects non-http(s); `proper-lockfile` mandatory on MD writes; no auto-submit of applications.
- **Performance**: Single-user, 192 MD rows — performance is non-issue. No premature optimization.
- **Distribution**: localhost-only (`npm run dev`). No production deploy, no CI/CD pipeline beyond `test-all.mjs --dashboard`.
- **Update compatibility**: santifer `update-system.mjs check` must continue to pass — no edits to system-layer files.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
