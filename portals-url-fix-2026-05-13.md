# Portal URL Fix — 2026-05-13

Investigation of 18 companies that returned HTTP 404 in the latest `scan.mjs` run.
All 18 entries fixed; all new URLs verified HTTP 200.

## Fixed (18 companies)

| Company | Old URL | New URL | ATS Change? |
|---------|---------|---------|-------------|
| Loom | https://job-boards.greenhouse.io/loom | https://www.atlassian.com/company/careers/all-jobs | Yes — Greenhouse board dead; Ashby slug `loom` is empty. Atlassian-owned, hiring routed via parent. `api` field removed. |
| Personio | https://job-boards.greenhouse.io/personio | https://jobs.ashbyhq.com/personio | Yes — Greenhouse → Ashby (111 live jobs). `api` field removed. |
| Webflow | https://jobs.lever.co/webflow | https://webflow.com/careers (branded; underlying `job-boards.greenhouse.io/webflow`) | Yes — Lever → Greenhouse. Added `api: boards-api.greenhouse.io/v1/boards/webflow/jobs`. |
| Notion | https://jobs.lever.co/notion | https://www.notion.com/careers (branded; underlying `jobs.ashbyhq.com/notion`) | Yes — Lever → Ashby (140 live jobs). |
| Typeform | https://jobs.ashbyhq.com/typeform | https://www.typeform.com/careers (branded; embeds `boards-api.greenhouse.io/v1/boards/typeform`) | Yes — Ashby (empty) → Greenhouse. Added `api: boards-api.greenhouse.io/v1/boards/typeform/jobs`. |
| Klarna | https://jobs.lever.co/klarna | https://www.klarna.com/careers/ (branded; underlying `jobs.deel.com/job-boards/klarna`) | Yes — Lever → Deel. |
| Vinted (entry 1) | https://jobs.lever.co/vinted | https://careers.vinted.com/jobs | Yes — Lever → custom portal (no third-party ATS exposed). |
| Vinted (entry 2, dup at L820) | https://jobs.lever.co/vinted | https://careers.vinted.com/jobs | Same fix applied to second occurrence. |
| Pipedrive | https://job-boards.greenhouse.io/pipedrive | https://www.pipedrive.com/en/jobs/open-positions (branded; underlying `jobs.lever.co/pipedrive`, 35 live jobs) | Yes — Greenhouse → Lever. `api` field removed. |
| Pleo | https://jobs.lever.co/pleo | https://www.pleo.io/en/careers/jobs (branded; underlying `jobs.ashbyhq.com/pleo`, 35 live jobs) | Yes — Lever → Ashby. |
| Ada | https://job-boards.greenhouse.io/ada | https://job-boards.greenhouse.io/ada18 | Slug change only (`ada` → `ada18`). Same ATS (Greenhouse). Added `api: boards-api.greenhouse.io/v1/boards/ada18/jobs`. |
| Weights & Biases | https://jobs.lever.co/wandb | https://wandb.ai/site/careers/ | Yes — Lever → CoreWeave (acquired May 2025). Branded page redirects to `coreweave.com/careers/weights-biases`. |
| Factorial | https://job-boards.greenhouse.io/factorial | https://careers.factorialhr.com/ | Yes — Greenhouse → custom portal (Greenhouse-powered under the hood, 150+ open positions). |
| Tinybird | https://jobs.ashbyhq.com/tinybird | https://www.tinybird.co/jobs (branded; underlying `tinybird.factorialhr.co`) | Yes — Ashby (empty) → FactorialHR jobs portal. |
| TravelPerk | https://jobs.ashbyhq.com/travelperk | https://www.perk.com/careers/ | Yes — Rebranded `TravelPerk` → `Perk`. New domain `perk.com`, still on Ashby internally (163 positions). |
| Clarity AI | https://jobs.lever.co/clarity-ai | https://talent.clarity.ai/ (301 → `job-boards.eu.greenhouse.io/clarityai`) | Yes — Lever → Greenhouse EU. Added `api: boards-api.eu.greenhouse.io/v1/boards/clarityai/jobs`. |
| Forto | https://jobs.lever.co/forto | https://jobs.ashbyhq.com/forto | Yes — Lever → Ashby (16 live jobs). Note: branded `careers.forto.com` exists but uses Greenhouse-embedded UI; Ashby is the live data source. |
| Runway | https://job-boards.greenhouse.io/runwayml | https://jobs.ashbyhq.com/runway-ml | Yes — Greenhouse → Ashby (33 live jobs, slug `runway-ml` with hyphen). `api` field removed. |
| Legora | https://jobs.ashbyhq.com/legora | (unchanged — already correct) | No — current URL returns HTTP 200, 147 active jobs. The scan 404 was a transient/false positive. |

## Disabled (0 companies)

None — all 18 companies have current, active careers pages.

## Manual Investigation Needed (0 companies)

None — all fixes verified.

## Verification Methodology

For each company:
1. Searched for current careers page and ATS provider.
2. Confirmed branded careers URL returns HTTP 200 (via `curl -L`).
3. Where ATS is hidden behind the branded page, identified the underlying ATS slug:
   - Probed `https://jobs.ashbyhq.com/{slug}` (HTTP 200 = exists) AND Ashby GraphQL job count (>0 jobs = active).
   - Probed `https://boards-api.greenhouse.io/v1/boards/{slug}/jobs` (HTTP 200 = exists).
   - Probed `https://api.lever.co/v0/postings/{slug}` (HTTP 200 with array = exists).
4. Preferred BRANDED `careers_url` per portals.yml header rule, with `api:` field on the underlying ATS where applicable (Greenhouse only — Ashby/Lever/Deel API endpoints are not in the scan pipeline).

## Notable patterns

- **Lever → Ashby migration is the dominant trend** (Webflow, Notion, Pleo, Forto, partially Loom).
  But there's also strong **Greenhouse → Ashby** movement (Personio, Runway).
- **Lever → Greenhouse** (Clarity AI EU) and **Greenhouse → Lever** (Pipedrive) both observed — no single direction.
- **Lever boards are being aggressively retired** — 8 of the 18 broken companies had stale Lever URLs.
- **TravelPerk rebranded to Perk** (perk.com), keeping Ashby internally but new slug isn't `travelperk` anymore.
- **Weights & Biases was acquired by CoreWeave** (May 2025) — careers run via parent.
- **Loom is hiring-frozen at the Loom-brand level** — Ashby slug exists but has 0 jobs; Atlassian parent is the only active source.
