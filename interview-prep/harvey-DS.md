# Deep Research: Harvey — Staff Design Systems Designer
*Generated: 2026-04-23 | Score: 4.225/5*

## 1. Design System Strategy

Harvey has an **active, recently rebuilt design system** — not a greenfield situation, but a system that was just re-architected from scratch in late 2025/early 2026. Key facts:

- **Blog post published January 16, 2026:** "Rebuilding Harvey's Design System From the Ground Up" (authors: Christopher Sim, Stephanie Yeung, Brian Nelson)
- **Previous state:** Collection of components across multiple Figma files with no clear ownership, multiple legacy/Shadcn/custom one-off variants, inconsistent token naming (scales ranging 910-940, 50-1000), no contribution process
- **Token architecture:** Semantic, intent-based naming. Role-based tokens like `foreground-base` that work across text, icons, and UI elements. Prefix `hy-` separates new tokens from Tailwind defaults and legacy. WCAG-compliant color system (light + dark) with consistent hue (~90°) and variable chroma by tone.
- **Figma → code pipeline:** Figma variables table synced to GitHub via GitHub Action. Designers update tokens in Figma; automation creates PRs. Engineers see exact token usage via Dev Mode — zero ambiguity.
- **Engineering stack:** React + Tailwind CSS. Tokens consumed as Tailwind classes (`bg-hy-bg-base`). Cursor AI rules configured to auto-use new tokens.
- **Component approach:** Figma components aligned 1:1 with code structure. Branching workflow for quality control. Step-by-step contribution guides. High-touch components rebuilt first.
- **Adoption enforcement:** Linter warnings for primitive token use, escalating to errors at 95% adoption threshold.
- **DS maturity level:** Mid-stage rebuild — foundation laid but implementation and migration ongoing. A Staff DS Designer would own the next phase: completing component coverage, enforcing adoption, scaling governance.

DS team contributors visible in blog: Cindy Nguyen, Billy Wan, Philip Cerles, Utkarsh Saxena, Bjørn Rostad, Nikhil Patel. Small, cross-functional EPD team.

## 2. Recent Moves (2025-2026)

Harvey is in hypergrowth territory — valuation tripled in under 12 months:

| Date | Event |
|------|-------|
| Feb 2025 | $300M Series D at $3B valuation (Sequoia-led) |
| Jun 2025 | $300M Series E at $5B valuation (Kleiner Perkins + Coatue) |
| Aug 2025 | $100M ARR announced |
| Dec 2025 | $8B valuation confirmed (a16z-led round) |
| Jan 2026 | $190M ARR (almost doubled in 5 months) |
| Mar 2026 | $200M growth round at **$11B valuation** (GIC + Sequoia co-lead) |

Total raised: $1B+. Investors: Sequoia, a16z, Kleiner Perkins, Coatue, Conviction Partners, Elad Gil, OpenAI (early backer via Sam Altman).

**Scale:** 650+ employees (up from ~100 a year prior), 1,000+ customers in 60 countries, 60%+ of AmLaw 100 law firms, 50%+ of Vault 100, 25,000+ legal agents running. EU app instance (`eu.app.harvey.ai`) signals active EU market.

**Product:** Workflow Builder (natural language → structured legal workflows), agent-based document analysis, LLM-native research, multi-model support (expanded beyond GPT-4 to proprietary models).

**Design system blog post** shipped Jan 2026 = signal that DS is a strategic investment, not an afterthought.

## 3. Engineering & Design Culture

- **In-office requirement:** 3+ days/week in SF, NYC, or London. No fully remote. London office is the EU/UK hub — relevant for CET timezone negotiations.
- **Pace:** Intensely fast. CEO Winston Weinberg: employees must "re-earn their role every six months." Glassdoor WLB: 3.4/5. Not a lifestyle company.
- **Design philosophy** (from "How We Approach Design at Harvey" blog): Three pillars — (1) Domain Awareness (design for legal professional standards), (2) Effortless Complexity (sophisticated tools that feel intuitive), (3) Intentional Design (deliberate visual/structural choices emphasizing trust and transparency).
- **Embedded legal expertise:** Many Product and Engineering colleagues have legal backgrounds — design validation happens with authentic legal domain understanding.
- **Design + Engineering collaboration:** DS token sync via Figma API + GitHub = tight design-code feedback loop. Dev Mode used actively. This is a design-code parity culture, not a handoff culture.
- **AI-assisted dev:** Cursor rules configured to enforce DS token adoption in AI-generated code — design system is part of the AI tooling stack.
- **Glassdoor overall:** 3.9/5 (33 reviews). 75% recommend. Cons: shifting priorities, limited formal career growth processes still being built.
- **Creative/design leadership:** Aatish Nayak identified as VP of Creative at Harvey (background: 3 AI unicorns, CMU, early-stage team building). Maggie Landers: Global Talent Acquisition lead.

## 4. Likely Challenges

- **DS is mid-rebuild, not done:** Foundation was laid in late 2025. A Staff hire likely owns: completing component coverage, driving adoption to 95%+, establishing contribution governance, scaling the system to support 650+ employees and growing EPD team.
- **Speed vs. system quality tension:** Harvey ships fast. A DS designer must enforce token/component adoption without becoming a blocker. The linter-based adoption enforcement pattern they chose shows pragmatic instinct — but governance at scale is still unsolved.
- **Legal UX complexity:** Legal professionals have very high standards for density, precision, and trust signals. UI patterns from consumer products don't map 1:1. Deep domain empathy needed.
- **Multi-product DS surface:** Harvey has desktop web app, mobile considerations, multiple workflows (research, drafting, review, agents). DS must support diverse interaction paradigms without fragmenting.
- **Remote gap for EU candidate:** In-office requirement (SF/NYC/London) is the primary risk for a CET-based candidate. London office is the realistic target, but EU residency vs UK residency post-Brexit is a wrinkle worth clarifying upfront.

## 5. Market Position

Harvey's key differentiation: **LLM-native legal AI** built from scratch for professional services, not a bolted-on AI layer. Unlike competitors:

| Competitor | Positioning | Harvey's edge |
|-----------|-------------|---------------|
| Ironclad | Contract lifecycle management (CLM) — workflow-first, AI secondary | Harvey is AI-first, not workflow-first |
| Clio | Legal practice management (SMB law firms) | Harvey targets BigLaw, enterprise, consulting |
| Lexion | Contract intelligence — data extraction focus | Harvey covers broader legal reasoning (research, drafting, review) |
| CoCounsel (Thomson Reuters) | LLM layer on top of Westlaw corpus | Harvey uses multiple models, not tied to legacy legal databases |
| Harvey | Multi-model, LLM-native, enterprise legal AI | Highest valuation in segment, deepest BigLaw penetration |

Harvey's brand moat: trust from top-tier law firms (Magic Circle, AmLaw 100) where stakes are extremely high. "Professional Class AI" is their positioning — precision and trust as core values, which directly maps to why design quality and the DS matter.

## 6. Michał's Angle

**This is a rebuild ownership role, not a greenfield.** Harvey already knows DS matters — they published a detailed rebuild blog in Jan 2026. The foundation (semantic tokens, Figma→GitHub sync, React+Tailwind) is in place. What they need next is a **Staff-level owner** to:

1. Complete component coverage across all product surfaces
2. Harden governance: contribution process, versioning, deprecation
3. Scale the DS to support a rapidly growing EPD team (650 → likely 1000+ in 12 months)
4. Integrate AI tooling into DS workflows (Cursor rules are already in place — Michał's AI-assisted DS automation experience is directly applicable)

**Token Studio expertise is a sharp differentiator.** Harvey's token system is currently Figma-native (Figma Variables API). Token Studio adds W3C-compliant export, multi-platform support, and deeper transformation pipelines — something Harvey will need as they scale to mobile and potentially desktop native. Michał can speak to this upgrade path directly.

**The story to tell:** "I spent 5 years building Vio.com's multi-brand token architecture at scale, then rebuilding it for AI-assisted maintenance. Harvey just rebuilt their DS foundation — I specialize in exactly what comes next: the governance, the adoption mechanics, and the tooling that makes it self-sustaining."

**The London angle:** Surface the London office as the natural base. CET to London is the same timezone overlap as CET to NYC-9h is not. Frame as "London-based EU citizen, CET, open to regular London office presence." This converts the remote risk into a manageable answer.

**Comp note:** Harvey's median SWE is $336K+ including equity. Staff DS Designer will be below that but in a strong range. Michał's EUR/B2B target is well below US equity comp — worth discussing hybrid structures (contractor via UK entity, or PAYE UK).
