# Deep Research: Fever — Senior Product Designer, Design Systems
*Generated: 2026-04-23 | Score: 4.575/5*

## 1. Design System Strategy

Fever has an internal Design Handbook at `design.feverup.com` — a public-facing portal that documents their design system and brand standards. This confirms the DS is mature enough to warrant a dedicated documentation site, not just a Figma file.

**Key signals from JD and research:**
- JD (roles/4090227101) explicitly asks for: "refactor, scale, and govern the existing Design System into a robust, enforceable multi-brand product platform, supporting multiple products and devices (web, mobile, and digital kiosks)"
- Multi-brand confirmed: DS needs to cover Fever consumer app, Fever for Business/B2B, Candlelight brand, DICE (acquired June 2025), Atom Tickets (acquired March 2025) — at minimum 4 product surfaces
- The Senior PD role (separate from DS role) also mentions "design with reusable components and scalable patterns" and reducing "inconsistencies and technical debt across teams" — sign that DS governance is a real pain point
- Guillermo Rosewarne (Product Designer & UX Engineer / Design System Lead) is an existing DS contributor — Michał would likely be his collaborator or lead on the DS track
- Figma is implied by the company's design workflow; Storybook + Zeroheight were explicitly named in the original JD eval source
- Digital kiosk support is a notable requirement — DS must handle non-standard viewports (event venue kiosks, potentially DICE point-of-sale hardware)

**What they likely don't have yet:**
- A unified token architecture across 4 acquired/parallel brands (Fever + Candlelight + DICE + Atom)
- Automated token sync pipeline (Token Studio → GitHub → code)
- Contribution model / governance framework beyond one internal lead
- Formal accessibility layer (WCAG) — entertainment apps are historically weak on a11y

## 2. Recent Moves (2025-2026)

| Date | Move |
|------|------|
| Mar 2025 | Acquired **Atom Tickets** (US cinema ticketing platform) |
| Jun 2025 | Raised **$100M** from L Catterton + Point72 Private Investments |
| Jun 2025 | Acquired **DICE** (London music ticketing, 10M+ MAU) |
| Jun 2025 | Combined entity: **$1.8B valuation**, 5,100+ employees |
| 2025 | Launched **Fever for Business / Candlelight for Business** — fully customizable B2B white-label experiential product |
| 2026 | Won **IFEMA MADRID contract** (fan experience 2026-2035) |
| 2025-2026 | Revenue: **$724M** (Latka data, June 2025), team: **5,153** (March 2026) |

**Implication for DS role:** Three acquisitions in 12 months means three separate product surfaces with their own codebases, design files, and component libraries that need unification or at minimum a shared token layer. This is a multi-brand token architecture problem Michał has solved before (Vio.com 5-brand system).

## 3. Engineering & Design Culture

**Glassdoor signals (349 reviews, April 2026):**
- Overall: ~3.7/5. 69-72% would recommend
- Pros: "amazing teams and people," "great culture," flexible hybrid work, private healthcare, gym (Gympass), events perks
- Cons: "lack of structure," "low and variable salaries," some reviews mention micromanagement (monitoring 8-hour days), slow career progression
- Comp rated 3.2/5 — consistent with the JD's €45-75k range being below market

**Remote policy:** JD says "flexible work" and is listed on remote job boards (designremotejobs.com). Spain-based company with EU hiring. CET timezone = good alignment for Michał in Poznań.

**Team composition:**
- Head of Product Design: **Fernanda Marques** (Barcelona, joined 2026, prev: FREENOW for Business, Stuart, Globo) — direct hiring manager
- Head of Product, Verticals: **Ruben Alcolea** (New York) — product leadership
- Existing DS lead: **Guillermo Rosewarne** (Product Designer & UX Engineer / DS Lead, 10+ yr exp)
- Product Designers: Nieves Valero, Ana Traba de la Gándara (also appears to be involved in recruiting for this role)
- Senior TA: Alessia De Rosa (Madrid, Senior Global TA Specialist since Apr 2024)

**Engineering blog:** `medium.com/fever-engineering` exists (89 followers, 5 editors) — low publishing cadence, no public DS-specific posts found.

**Tech stack signals from JD:** Svelte, SwiftUI, Compose (multi-platform engineering org). DS must produce tokens/components that work across web (Svelte), iOS (SwiftUI), Android (Compose). This is a code-connected DS, not just Figma.

## 4. Likely Challenges

1. **Post-acquisition fragmentation** — Fever + DICE + Atom Tickets each have their own product surfaces. A DS role hired now likely has a mandate to unify or at minimum federate token layers across these products.
2. **Multi-brand at scale** — Fever consumer, Candlelight, Fever for Business, DICE, Atom = 5 distinct brands. One person (Guillermo) can't own this alone.
3. **Kiosk + web + mobile coverage** — DS must handle non-standard viewports without dedicated mobile DS engineers in many companies this size.
4. **Comp pressure / "low salaries"** — Glassdoor and JD range confirm this. Negotiation should push for B2B contract framing.
5. **Lack of governance** — "Inconsistencies and technical debt across teams" mentioned in the Senior PD JD is a tell. The DS doesn't yet have enforced contribution standards.
6. **Documentation gaps** — Design Handbook exists publicly but depth of token documentation, component API specs, and contribution guides is unknown.

## 5. Market Position

Fever competes in the **experience discovery + ticketing** space:

| Competitor | Angle |
|-----------|-------|
| TimeOut | Editorial-first, less tech |
| Eventbrite | Self-serve organizer platform |
| Meetup | Community events |
| Bandsintown | Artist-led music discovery |
| DICE (now owned) | Music-first ticketing — acquired |
| Resident Advisor (RA) | Electronic/club music niche |

Fever's differentiation: **AI-driven discovery engine** + **original experiences** (Candlelight, immersive art) + **global footprint** (40 countries, 300M reach) + **B2B white-label** (Candlelight for Business). No single competitor has this full stack.

The $1.8B valuation and $100M raise position Fever as the dominant independent (non-Ticketmaster/Live Nation) player, with a clear consolidation strategy (two ticketing acquisitions in 3 months).

## 6. Michał's Angle

**Lead story:** Multi-brand token architecture for post-acquisition consolidation.

Michał's Vio.com work = 5-year ownership of a multi-brand DS with token-level brand overrides. Fever just acquired DICE + Atom in 3 months and has Candlelight + Fever for Business as parallel brands. This is the exact same problem: one token system, N brand skins, enforced via code-connected Figma files.

**Specific talking points:**

- **Token Studio + Figma + GitHub pipeline:** Fever needs tokens to flow into Svelte/SwiftUI/Compose. Michał has this in production. Name the pipeline explicitly.
- **Multi-brand theming:** "I built a 5-brand override system at Vio.com. Fever has 4-5 brand surfaces post-acquisition. I know what the governance model needs to look like."
- **WCAG in entertainment:** Fever is weakest here by default (entertainment apps deprioritize a11y). Michał's RTL + Arabic DS at Crafton ME + government work makes him unusually credible on accessibility. Frame it as "competitive moat most entertainment DS don't have."
- **AI-assisted documentation:** JD mentions AI integration. Michał has automated doc generation. Match this to their Zeroheight documentation gap.
- **Kiosk/multi-device:** If Michał has any non-mobile/web DS token work (responsive tokens, viewport-agnostic primitives), mention it. Otherwise acknowledge and show token architecture handles it structurally.

**What NOT to lead with:** Arabic DS, government work. Fever is consumer entertainment. Lead with Vio.com multi-brand, then Token Studio pipeline, then WCAG as differentiator.
