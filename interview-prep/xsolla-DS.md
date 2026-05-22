# Deep Research: Xsolla — Design System Designer
*Generated: 2026-04-23 | Score: 4.20/5*

## 1. Design System Strategy

Xsolla runs a multi-product platform with distinct UI surfaces: Pay Station (checkout), Publisher Account (dev dashboard), Store (in-game shop), Site Builder (white-label game sites), Login SDK, Catalog, and Offerwall. Each product serves a different user — player, developer, publisher — which means the DS must support radically different UX patterns under one visual roof.

**ZK UI Kit (confirmed):** Xsolla publishes a Figma Community file called the "Xsolla ZK UI Kit" — 50+ production-ready components, fully responsive, cross-platform (PC/mobile/web). The "ZK" branding suggests a dedicated DS sub-team. Kira Kosmacheva holds a "Senior Frontend Developer at Design System product" title, confirming there's a design system product vertical. The DS role Michał is applying for sits in this vertical.

**White-label complexity is the core DS challenge.** Site Builder and the Reseller Program (launched March 2026) require game studios to apply their own brand on top of Xsolla's components. This is a token architecture problem — exactly the multi-brand token work Michał did at Vio.com (5 brands, Token Studio, GitHub sync). This is the single strongest angle in this application.

**SDK unification as DS trigger:** The March 2026 Xsolla SDK launch consolidated PC/mobile/web tools into a single download. A unified SDK means a unified UI layer is needed. Expect a DS consolidation effort to follow — this is why the role exists now.

## 2. Recent Moves (2025-2026)

| Date | Move |
|------|------|
| Mar 2026 | Xsolla SDK launched — unified cross-platform monetization (Payments + Login + Catalog + Offerwall) |
| Mar 2026 | Reseller Program — game devs sell into Southeast Asia + LatAm via vetted partners (white-label surface) |
| Mar 2026 | Xsolla Agency — IP licensing service for developers |
| Mar 2026 | Payment expansion — 7 new local methods across 18 EMEA + Asia markets |
| GDC 2026 | New brand identity revealed + "Next Era of Game Commerce" positioning |
| Mar 2025 | Xsolla Ecosystem (network platform), Loyalty as a Service, Xsolla Gold Gift Card, Publishing Suite |
| 2025-2026 | GamesForum global event partnership — marketing presence in gaming industry |
| Apr 2026 | gamescom latam 2026 showcase confirmed (São Paulo) — LatAm push |

**Takeaway:** Xsolla is in an aggressive expansion phase — new products, new markets, new brand identity. Each of these requires new UI surfaces. A DS role hired now will be building for scale, not maintenance.

## 3. Engineering & Design Culture

**Glassdoor signal (3.3/5 overall, 146 reviews):**
- Work-life balance: 3.7 — above average
- Culture & values: 3.2 — mixed
- Career opportunities: 3.3 — mediocre

**Positives reported:** Good colleagues, flexible hours, remote work, fair compensation, strong team leads at the individual level.

**Red flags reported:** CEO micromanagement, fear-based compliance culture, fuzzy corporate vision, and opaque layoffs. The "20/40/40 model" referenced by employees — 40% constant turnover — suggests instability at company level.

**Remote policy:** Global team with offices including Encino CA (HQ), and presence in EMEA. Remote appears available. EU citizenship + CET is compatible.

**Design team:** Igor Starkov (Senior Product Designer), Kira Kosmacheva (Senior FE Dev, DS product), Anna Grinberg, Kir Romanovsky (Design System Designer — the role that was previously filled or a peer role). Small, specialist DS team.

**Eng stack inference:** Web-first, multi-platform. React likely. SDK now unified = single codebase push. DS role will need to work closely with frontend developers (Kira's role confirms dev-DS collaboration).

## 4. Likely Challenges

1. **White-label / brand theming at scale** — Site Builder and Reseller Program require game studios to skin Xsolla UI. Managing brand tokens per publisher across 1,000+ games = the exact problem Vio.com's 5-brand token architecture solved. Lead with this directly.

2. **Multi-product DS unification** — Pay Station, Publisher Account, Store, Site Builder, Login all likely have diverged component sets. The SDK unification in March 2026 creates the political moment to also unify the design layer.

3. **International / RTL markets** — Payment expansion into 18 EMEA + Asia markets in March 2026 means Arabic, Hebrew, Farsi surfaces may be required. Michał's RTL-first DS experience is a concrete differentiator.

4. **Gaming-specific component complexity** — Game UIs require components that standard DS libraries don't have: in-game overlays, controller-friendly navigation, animated reward states, dynamic pricing surfaces. The ZK UI Kit is their answer — this is what the role maintains and extends.

5. **CEO instability risk** — Glassdoor signals suggest top-down pressure. DS work requires long-term vision to succeed. This is a risk to acknowledge internally; verify during interview if there's DS leadership buffering from org politics.

## 5. Market Position

Xsolla vs. competitors:

| | Xsolla | PayPal | Digital River | FastSpring |
|--|--------|--------|---------------|------------|
| Gaming-native | Yes | No | Partial | No |
| White-label storefront | Yes | No | Yes | No |
| In-game payments | Yes | Limited | No | No |
| 1,000+ payment methods | Yes | ~50 | ~200 | ~30 |
| Game-specific analytics | Yes | No | No | No |

**Xsolla's moat:** Gaming-native infrastructure. PayPal and Stripe are payment rails; Xsolla is a complete game commerce OS. The platform serves 2,000+ game companies including Ubisoft, Valve, and Roblox partners. This scale means the DS must be production-grade — not a startup experiment.

**2026 strategic bet:** Direct-to-consumer (D2C) for game developers. As app stores raise fees, devs want to own the player relationship. Xsolla's "own your audience, data, and revenue" CMO quote at GDC 2026 signals the DS must support D2C storefronts that match AAA game brand quality.

## 6. Michał's Angle

**Primary hook:** White-label token architecture. At Vio.com Michał built a 5-brand multi-token DS using Token Studio + Figma + GitHub sync. Xsolla's Site Builder and Reseller Program require exactly this: one base component layer, per-publisher brand tokens on top, automated to deploy at scale. Frame Vio.com as proof-of-concept for what Xsolla needs in 2026.

**Secondary hook:** RTL-first. Expansion into EMEA markets (Arabic, Hebrew) is live as of March 2026. Michał's RTL-first DS work removes a concrete blocker for this expansion.

**Tertiary hook:** AI-assisted DS workflows. Xsolla is building an increasingly complex SDK/UI ecosystem. AI-assisted component generation and token automation reduces the bottleneck between product launches and DS coverage.

**What to de-emphasize:** Gaming context itself — don't oversell gaming knowledge. Focus on the systemic DS challenges (tokens, white-label, multi-product) that are industry-agnostic but happen to be urgent at Xsolla.

**Culture risk mitigation:** During interview, ask about DS team autonomy and relationship with product leadership. If DS reports through a stable VP-level design leader, the CEO instability is buffered.
