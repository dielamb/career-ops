# Changelog

## [1.9.0](https://github.com/dielamb/career-ops/compare/career-ops-v1.8.0...career-ops-v1.9.0) (2026-05-23)


### Features

* **01-01:** scaffold Next.js 15 + TypeScript + Tailwind v4 dependency tree\n\n- dashboard/web/package.json: Next.js 15 + React 19 + TS strict + Tailwind v4\n- dashboard/web/tsconfig.json: strict mode, bundler moduleResolution, @/* paths\n- dashboard/web/next.config.ts: minimal Next.js 15 config with reactStrictMode\n- dashboard/web/.gitignore: node_modules, .next, build artifacts excluded\n- dashboard/web/package-lock.json: lockfile committed for reproducible installs\n- dashboard/web/public/.gitkeep: public dir placeholder\n- dashboard/web/README.md: local dev instructions + layout overview\n- santifer system layer untouched (git diff package.json = empty)\n ([36068b3](https://github.com/dielamb/career-ops/commit/36068b3589e557c689d31dcee9e7ca8af4053ee6))
* **01-01:** wire DESIGN.md tokens into Tailwind v4 [@theme](https://github.com/theme) + smoke page\n\n- app/globals.css: [@import](https://github.com/import) tailwindcss + [@theme](https://github.com/theme) block with ALL DESIGN.md tokens\n  (colors, fonts, type scale xs-5xl, spacing 2xs-3xl, radius none/sm/md/lg)\n- app/layout.tsx: root layout loading Bricolage Grotesque + IBM Plex Mono (Google)\n  + General Sans (Fontshare) via CDN links\n- app/page.tsx: smoke page rendering 'Today.' hero in Bricolage display font +\n  Y2K card (2.5px ink border + 6px offset shadow) + 3 neon accent pills\n- postcss.config.mjs: @tailwindcss/postcss plugin registered\n- tailwind.config.ts: content glob for ./app + ./components\n- npm run build exits 0 (Next.js 15 + Tailwind v4 + TypeScript strict compile OK)\n ([e125980](https://github.com/dielamb/career-ops/commit/e1259803103b2f0dc472242111ac6193f834e699))
* **01-02:** add --dashboard flag to test-all.mjs for dashboard-only test run\n\n- Adds const DASHBOARD = process.argv.includes('--dashboard')\n- Inserts early-exit branch after suite header: when --dashboard is set,\n  runs vitest + playwright in dashboard/web/ and exits before sections 1-10\n- Sections 1-10 of santifer battery are byte-identical (zero modifications)\n- node test-all.mjs --dashboard exits 0: 2 passed (vitest + playwright) ([bfab380](https://github.com/dielamb/career-ops/commit/bfab3806f18225d711ffd8d2bad105483356b69e))
* **01-02:** install vitest + playwright + wire smoke tests in dashboard/web/\n\n- package.json: add test, test:run, test:e2e scripts\n- package-lock.json: vitest@2.1.9, @playwright/test, jsdom, @vitest/ui\n- vitest.config.ts: jsdom environment, includes tests/**/*.test.{ts,tsx}\n- playwright.config.ts: chromium-only, testDir=e2e, webServer auto-starts next dev\n- tests/smoke.test.ts: expect(1 + 1).toBe(2) -- vitest smoke\n- e2e/smoke.spec.ts: page.getByText(Today.) -- playwright smoke\n- npm run test:run exits 0, npm run test:e2e exits 0 ([9129982](https://github.com/dielamb/career-ops/commit/912998283b631d15ca47292aeaa1c5ae08738354))
* **02-data-layer-01:** install Phase 2 dependencies into dashboard/web/\n\n- zod, gray-matter, proper-lockfile, remark, remark-parse, papaparse runtime deps\n- @types/proper-lockfile, @types/papaparse devDependencies\n- package-lock.json force-added per Phase 1 lockfile precedent\n- npm install exits 0, no peer-dep errors\n- santifer update-system.mjs check exits 0 ([78192e6](https://github.com/dielamb/career-ops/commit/78192e68055c6b96345f0cf4983f71e120b33731))
* **02-data-layer-01:** write lib/schemas.ts with all 5 Zod schemas + ParseError type\n\n- ApplicationSchema + Application type: 8-status enum, score/reportPath nullable\n- PipelineEntrySchema + PipelineEntry type: 4-state enum for [x|s|!|space] checkboxes\n- ReportSchema + Report type: blocks A-F nullable, legitimacy hoisted to top-level\n- ListingSchema + Listing type: report + pdfPath pair\n- ParseError interface: row/raw/reason for per-row parser error boundary\n- tsc --noEmit --skipLibCheck exits 0 ([3eb821e](https://github.com/dielamb/career-ops/commit/3eb821e9546d936ea153127bcb129cb98e14059d))
* **02-data-layer-02:** parse-applications parser with 5 vitest tests and fixtures ([6093aa6](https://github.com/dielamb/career-ops/commit/6093aa6427677e5055acb700df2f65df5a466d23))
* **02-data-layer-02:** parse-pipeline parser with 5 vitest tests and fixtures ([7f8afe1](https://github.com/dielamb/career-ops/commit/7f8afe1bcbe970fba952ebf978e73777fea422f9))
* **02-data-layer-02:** parse-reports parser with 4 vitest tests and fixtures ([9c26d6d](https://github.com/dielamb/career-ops/commit/9c26d6d2623f96dc9bbe9c3a559c6aa055996865))
* **02-data-layer-03:** git-commit.ts lockedWrite + LockedError + 4 tests ([25b3953](https://github.com/dielamb/career-ops/commit/25b3953c26f90b6e23eb38958b6e7e06e716ea2d))
* **02-data-layer-03:** spawn-mjs.ts array-form spawn + URL validator + 5 tests ([0abe7b5](https://github.com/dielamb/career-ops/commit/0abe7b560633e0417f1554bf427bce00edb0349a))
* **03-api-routes-01:** GET /api/applications + GET /api/pipeline routes + 4 integration tests ([33e93f8](https://github.com/dielamb/career-ops/commit/33e93f866adfc63fce47b72084cfbf13cedb532e))
* **03-api-routes-01:** GET /api/listing/[id] dynamic route + 2 integration tests ([85a75bf](https://github.com/dielamb/career-ops/commit/85a75bffe8880eb3a2529285153c4d8fb3237962))
* **03-api-routes-01:** vitest node env + api-helpers + api-paths shared modules ([2e50f8f](https://github.com/dielamb/career-ops/commit/2e50f8f97edeb39c4f4e609fb2906e2cce77a179))
* **03-api-routes-02:** POST /api/actions/apply route + 2 tests ([e3c3d82](https://github.com/dielamb/career-ops/commit/e3c3d82489d50ed12368ee3aea7bdc0bb422b726))
* **03-api-routes-02:** POST /api/actions/mark-sent route + 2 tests ([0bb067c](https://github.com/dielamb/career-ops/commit/0bb067cb1491c11c3cc8d40a979729728ef6d420))
* **04-billing-01:** add atomic increment_eval_count Postgres function\n\n- CREATE OR REPLACE FUNCTION public.increment_eval_count(uuid, int) RETURNS int\n- SECURITY DEFINER + search_path=public to bypass RLS safely\n- Handles month rollover via upsert reset\n- Conditional UPDATE WHERE eval_count &lt; p_limit RETURNING eliminates TOCTOU race\n- GRANT EXECUTE to authenticated and service_role\n ([e82cbd9](https://github.com/dielamb/career-ops/commit/e82cbd930e3201f21aba9c6a238cff6575db14e4))
* **04-billing-01:** expose evalCount/limit/hasApiKey from /api/billing/status\n\n- Add hasApiKey boolean (derived from anthropic_api_key_encrypted presence)\n- Limit field: null for BYOK, 100 for Pro hosted, 5 for free\n- evalsRemaining: null for BYOK, Math.max(0, limit - evalCount) otherwise\n- Remove legacy freeLimit:10 field\n- Response shape: { isPro, proUntil, evalCount, limit, hasApiKey, evalsRemaining }\n ([d17d54d](https://github.com/dielamb/career-ops/commit/d17d54d6220fe0946159487776ca4ee366f2ed58))
* **04-billing-01:** rewrite intake route with atomic eval gate + correct limits\n\n- Replace read-then-update with supabase.rpc('increment_eval_count') atomic gate\n- Free tier limit: 5/mo (was 10); Pro hosted: 100/mo; BYOK: unlimited (gate skipped)\n- 429 response body: { error, upgradeRequired, count, limit } for client UI gating\n- Remove trailing upsert (double-increment eliminated)\n- evalsRemaining: null for BYOK, Math.max(0, limit - currentCount) otherwise\n- database.types.ts: add increment_eval_count RPC signature for TypeScript safety\n ([1563c4b](https://github.com/dielamb/career-ops/commit/1563c4b43ed40c53c144c3e0eba9ffbcb0f5627b))
* **04-billing-02:** add 7-day trial + fix success_url + update billing page to 5-eval limit ([6e01b05](https://github.com/dielamb/career-ops/commit/6e01b0507c1fc56a61a4bbbd8be9e680f9ba6616))
* **04-components-01:** create lib/motion-presets.ts with 5 Framer Motion variants ([23ab86c](https://github.com/dielamb/career-ops/commit/23ab86c25662453d9a3dbc8dcfd794c3c9a96316))
* **04-components-01:** install framer-motion + [@testing-library](https://github.com/testing-library) deps ([6baa32f](https://github.com/dielamb/career-ops/commit/6baa32f0c76d06ed17a6db28ab67286f0cfd3d48))
* **04-components-01:** wire vitest setupFiles + jest-dom matchers ([208c74e](https://github.com/dielamb/career-ops/commit/208c74ecca446bb89cc305b20ab2a2e2dbbb43bf))
* **04-components-02:** add 4 RTL component tests + fix JSX transform in vitest\n\n- StatusBadge.test: status text, colour classes, Rejected line-through, motion wrapper\n- ScoreBar.test: progressbar role, fill width proportional, clamp over-max, clamp negative\n- ListingCard.test: company/role/score/source render, StatusBadge child, onOpen click, motion wrapper\n- ProgressMeter.test: 4 stat cells, progressbar aria attrs, segment widths, motion wrapper\n- vitest.config: add esbuild jsx automatic transform (jsxImportSource react) to fix React undefined\n- Test count: 50 passing (34 baseline + 16 new) ([f633c8c](https://github.com/dielamb/career-ops/commit/f633c8cee95ba478f1557149b35d4e3e6071a9bb))
* **04-components-02:** create 4 motion-wrapped component shells\n\n- StatusBadge: fadeUp preset, inline-block span wrapper\n- ScoreBar: fadeUp preset, div wrapper\n- ListingCard: layoutSpring + layout prop + whileHover translate (-3,-3)\n- ProgressMeter: fadeUp preset, div wrapper\n- All wrappers: use client directive, import raw sibling, import preset from motion-presets ([7abd1e3](https://github.com/dielamb/career-ops/commit/7abd1e3c2e2865ab3e5ea9aa9a8b5e2a86b9273c))
* **04-components-02:** create 4 raw presentational components\n\n- StatusBadge: maps 8 status values to DESIGN.md color classes\n- ScoreBar: proportional fill bar with aria progressbar attrs and clamping\n- ListingCard: Y2K card with 2.5px border and 6px offset shadow\n- ProgressMeter: 4-stat grid plus multi-segment horizontal bar\n- No hex literals, no framer-motion, no hooks in raw/ layer ([8ebf922](https://github.com/dielamb/career-ops/commit/8ebf922c78a9d86d6569d6d586c2e6e8b5c4554c))
* **05-pages-e2e-01:** replace smoke page.tsx with /today server component ([6b592af](https://github.com/dielamb/career-ops/commit/6b592af716fb15639101a93117e2294ef17c38c1))
* **05-pages-e2e-01:** Sidebar raw + wrapper + mount in app/layout.tsx ([7ab1984](https://github.com/dielamb/career-ops/commit/7ab198475198df84520259c6590364d88a4bf149))
* **05-pages-e2e-01:** TodayHero raw + motion wrapper ([fd9e258](https://github.com/dielamb/career-ops/commit/fd9e2589f9360a7c9a36715fed2eb9d9b42c7c21))
* **05-pages-e2e-02:** /pipeline server page with PipelineTable\n\n- Server component calls parsePipeline(pipelinePath()) directly (no SSR self-fetch)\n- Renders parse-errors banner when pipeline.md has invalid rows\n- Mounts PipelineTable client wrapper with full row data\n- force-dynamic; npm run build exits 0 with /pipeline route ([5596d50](https://github.com/dielamb/career-ops/commit/5596d50e9fbe96eb65e6f87c54ba883662da19d4))
* **05-pages-e2e-02:** ListingModal raw + motion wrapper + /api/file passthrough\n\n- raw/ListingModal: side-by-side MD pane + PDF iframe, action bar, inline status messages\n- ListingModal: client wrapper fetching /api/listing/[id], ESC handler, 423 -&gt; Locked inline error\n- /api/file route: path-traversal-safe PDF passthrough for PDF iframe src ([def9896](https://github.com/dielamb/career-ops/commit/def98966b351a9d73b20b2a7ed21e38d88336982))
* **05-pages-e2e-02:** PipelineTable raw + motion wrapper\n\n- raw/PipelineTable: filter chips for state/source/score, search input, sorted rows, row click handler\n- PipelineTable: client wrapper owning filter/search/selection state\n- LayoutGroup layout animations, conditionally renders ListingModal on row select\n- empty-set-means-no-constraint filter UX ([e008279](https://github.com/dielamb/career-ops/commit/e00827978fd3390ff3ce7e3f066859d61d102bc4))
* **05-pages-e2e-03:** apply-flow E2E spec (TST-06 happy path)\n\n- Mocks /api/pipeline with deterministic row (num=42, Acme Robotics)\n- Mocks /api/listing/42 so the modal renders without real filesystem\n- Intercepts POST /api/actions/apply â 200, asserts { url } payload\n- Asserts modal-apply-message shows 'opened in Chrome' after success\n ([402263b](https://github.com/dielamb/career-ops/commit/402263becbe6ea64ead32bae685e817719aba612))
* **05-pages-e2e-03:** malformed-md E2E spec + fixtures (TST-06 error boundary)\n\n- applications-malformed.md: 1 valid row + 1 malformed row â produces ParseError[]\n- pipeline-happy.md: minimal 1-row pipeline fixture (referenced by spec)\n- malformed-md.spec.ts: snapshot-restore pattern around beforeAll/afterAll\n  swaps data/applications.md with fixture, drives SSR /today, asserts\n  parse-errors-banner visible + page does not crash to Next.js error boundary\n ([999c077](https://github.com/dielamb/career-ops/commit/999c077ff3520300478fd2e9cbdb951929ad2c32))
* **05-pages-e2e-03:** mark-sent-lock E2E spec (TST-06 lock contention)\n\n- Mocks /api/pipeline with deterministic row (num=17, LockCorp)\n- Mocks /api/listing/17 so modal renders\n- Intercepts POST /api/actions/mark-sent â 423, asserts { id, status } payload\n- Asserts modal-mark-message shows 'Locked, try again'\n- Re-asserts modal is still visible after 423 (must not auto-close)\n ([e7212d1](https://github.com/dielamb/career-ops/commit/e7212d1fbeffa5100cdf6ce679ca64fbec4c0100))
* **06-A:** Run Scan button + Toast system\n\n- POST /api/actions/scan spawns node scan.mjs detached, logs to /tmp\n- GET /api/actions/scan/status polls log file for completion signal\n- ScanButton component: POST â toast 'Scan started' â poll â toast 'Scan complete: N offers'\n- ToastProvider/useToast context: bottom-right floating, font-mono uppercase, 4s auto-dismiss\n- ScanButton added to /today header next to hero heading\n- layout.tsx: wrapped body with ToastProvider + added CommandPalette placeholder\n ([9b908bb](https://github.com/dielamb/career-ops/commit/9b908bb14b74a84586a14cde605be59c329955f8))
* **06-BC:** Find Contacts + Cover Letter in ListingModal ([3b772af](https://github.com/dielamb/career-ops/commit/3b772af4a8e2d857bdc09132618ce5c6727e64f5))
* **06-D:** Quick Add URL widget in sidebar ([c37fc99](https://github.com/dielamb/career-ops/commit/c37fc99c0ef588b302738f7d207893cf99cca0b8))
* **06-EF:** inline status dropdown + filter persistence in PipelineTable\n\n- PipelineTable raw: new App Status column with select dropdown per row\n  stopPropagation prevents row click when interacting with dropdown\n  optimisticStatuses map drives controlled value for instant feedback\n- PipelineTable client: handleStatusChange POST /api/actions/mark-sent\n  optimistic update on select, revert on network error\n- Filter persistence: activeStates/activeSources/minScore/search persisted\n  to localStorage key 'careerops-pipeline-filters' on every change\n  restored from localStorage on mount (SSR-safe typeof window check) ([113bfce](https://github.com/dielamb/career-ops/commit/113bfce4172086528b30d8182c62152b3a588479))
* **06-G:** Cmd+K command palette\n\n- CommandPalette: global Cmd+K / Ctrl+K listener, ESC to close\n- Fetches /api/applications + /api/pipeline on open, builds unified entry list\n- Substring search, top 20 results, keyboard nav (ArrowUp/Down/Enter)\n- Y2K aesthetic: ink/60 overlay, centered card, IBM Plex Mono input\n- Mounted in layout.tsx (already added in commit 06-A) ([933fbf0](https://github.com/dielamb/career-ops/commit/933fbf04ce8a26ea1d2519ca7accfa3e9d278c7b))
* add structured machine summaries to evaluations ([#444](https://github.com/dielamb/career-ops/issues/444)) ([19a1820](https://github.com/dielamb/career-ops/commit/19a1820f99e05db68508a2b769379384636a9e83))
* add Ukrainian language and market support ([#323](https://github.com/dielamb/career-ops/issues/323)) ([06d70d3](https://github.com/dielamb/career-ops/commit/06d70d30b26754228e7560e6477f94e8d5360874))
* **api:** migrate /api/applications + /api/pipeline routes to Supabase ([6ca0f59](https://github.com/dielamb/career-ops/commit/6ca0f5939d46b9259bca305ba2fd78e7591bdd74))
* **auth:** add Next.js middleware for session refresh and auth redirect ([2a714b5](https://github.com/dielamb/career-ops/commit/2a714b52c9f5552e027e5e1ca454a24ed92da190))
* **auth:** add OAuth callback route (app/auth/callback/route.ts) ([795e544](https://github.com/dielamb/career-ops/commit/795e54485f01fece38e8837c2004bd1c1bf59868))
* **auth:** add Supabase async server client (lib/supabase-server.ts) ([6aeee2e](https://github.com/dielamb/career-ops/commit/6aeee2e92aecb93da724fa5cefb63c44eaf3e4a8))
* **auth:** add Supabase browser client (lib/supabase.ts) ([9b561eb](https://github.com/dielamb/career-ops/commit/9b561eb1b4fc0d89031cbcbfa224ecf617aa99b7))
* **auth:** add Y2K Maximalist auth page (UI shell, Supabase stubs) ([4f8675e](https://github.com/dielamb/career-ops/commit/4f8675e72992ce91426ee162a1601a693983b74e))
* **auth:** wire auth/page.tsx stubs to Supabase signInWithPassword + signInWithOAuth ([11c4e85](https://github.com/dielamb/career-ops/commit/11c4e85c9050da4cd8441642a6ad50eeaf11a099))
* **batch:** add --model flag to batch-runner.sh ([#504](https://github.com/dielamb/career-ops/issues/504)) ([44def35](https://github.com/dielamb/career-ops/commit/44def35c23c43e91d9633951d90f4ff50773c931))
* commit pre-existing billing layer files to git ([6c84092](https://github.com/dielamb/career-ops/commit/6c84092b06e5daa1d6c08c0893a57f2a3d1adb4f))
* **cv-pdf:** replace pdf-parse with Claude document API — handles multi-column layouts ([58945ed](https://github.com/dielamb/career-ops/commit/58945ed70294948fd7bef199624f0dd7da6b2fef))
* **dashboard:** /-key live search across pipeline rows ([#526](https://github.com/dielamb/career-ops/issues/526)) ([433f34f](https://github.com/dielamb/career-ops/commit/433f34f20aec61c68fda5dd9274a06919d0d7fc2))
* **dashboard:** Active Scans widget with live progress on /today ([1972f80](https://github.com/dielamb/career-ops/commit/1972f80f25bd22cf2c1936cb20d9660f3f80729c))
* **dashboard:** reject job-aggregator root URLs with helpful message ([6655504](https://github.com/dielamb/career-ops/commit/66555047dd2b7bdfc7248b79192e13799d9fffab))
* **dashboard:** render report MD with proper formatting via react-markdown ([12d6d81](https://github.com/dielamb/career-ops/commit/12d6d81092e2b08f9e9b7867d260e4d128298b1e))
* **dashboard:** tabbed ListingModal layout per ui-ux-pro-max design ([a1cb6bf](https://github.com/dielamb/career-ops/commit/a1cb6bff23c1a951d6a8c60ab82167fac504aafb))
* **i18n:** add Turkish (TR) language modes ([#341](https://github.com/dielamb/career-ops/issues/341)) ([e87eb57](https://github.com/dielamb/career-ops/commit/e87eb576df3aa394a7e28acd9f04a805ca0ca696))
* **intake:** job URL intake — ATS fetch (Greenhouse/Ashby/Lever) + Claude scoring + Supabase storage ([33bf0c7](https://github.com/dielamb/career-ops/commit/33bf0c7e908bf8d2a54b2e8041f378e37d06fe11))
* **interview-prep:** split prep by interviewer audience ([#489](https://github.com/dielamb/career-ops/issues/489)) ([d86b86c](https://github.com/dielamb/career-ops/commit/d86b86c93ada6cd8d74213357a1566f17dccd280))
* **layout:** create (main) route group with sidebar shell ([078e96a](https://github.com/dielamb/career-ops/commit/078e96a7f79405db278e72cd0a9cb435c440818c))
* **pipeline/scan:** M2 auto-fill pending pipeline + M3 per-user title filter ([f702615](https://github.com/dielamb/career-ops/commit/f70261585e13316d391a7d06b8bac3c7a1f50546))
* **pipeline:** in-dashboard modal for Supabase-backed pipeline rows ([400ee3b](https://github.com/dielamb/career-ops/commit/400ee3b9a565b2def17477866ff6e46757757b1f))
* **pipeline:** migrate pipeline page from MD parser to Supabase ([64e23b1](https://github.com/dielamb/career-ops/commit/64e23b172bf091d3bbd04275f5c9549e620ffd5d))
* **scan:** add --verify flag to drop expired postings before pipeline append ([#487](https://github.com/dielamb/career-ops/issues/487)) ([82f0c2e](https://github.com/dielamb/career-ops/commit/82f0c2ef9ee2155cf70300c2f64e15eeaf40a69e))
* **scan:** add local-parser provider and agent skip rules ([#595](https://github.com/dielamb/career-ops/issues/595)) ([b3ef0ae](https://github.com/dielamb/career-ops/commit/b3ef0ae3d7ca9ebffc1d8a524408c5dfa42e3446))
* **scan:** add optional always_allow tier to location_filter ([#652](https://github.com/dielamb/career-ops/issues/652)) ([d152da3](https://github.com/dielamb/career-ops/commit/d152da36e7625c229d15f6f2ef92ab43d4398cc8)), closes [#650](https://github.com/dielamb/career-ops/issues/650)
* **scan:** ATS provider fetchers (greenhouse/ashby/lever) ([4dfdde9](https://github.com/dielamb/career-ops/commit/4dfdde90231c022f955d7b911799d733ce60df1d))
* **scan:** per-user POST /api/scan/run endpoint ([90ac2ca](https://github.com/dielamb/career-ops/commit/90ac2cab1957027886ccaacd76815fc13b387a35))
* **scan:** portals.yml loader + title filter helpers ([0fdd0e7](https://github.com/dielamb/career-ops/commit/0fdd0e717b311a326e95efc8965431db78a01d4e))
* **scan:** un-gate ScanButton + middleware note for /api/scan/run ([74db5b9](https://github.com/dielamb/career-ops/commit/74db5b92f9e6862d5e7453b05ad164e0ae3b4388))
* **schema:** Supabase v1 schema migration (5 tables + RLS + indexes) + TypeScript types ([8855762](https://github.com/dielamb/career-ops/commit/8855762ce8b7f69d7e6ee927df376558bcfbca89))
* **settings:** PDF CV upload — extract text with pdf-parse, populate CV textarea ([454f9e7](https://github.com/dielamb/career-ops/commit/454f9e7c17708e334c70de751391ef1832169ce8))
* **settings:** settings page with CV + API key forms → Supabase profiles ([26ef993](https://github.com/dielamb/career-ops/commit/26ef993f828d4944e116bb2fe6fb33fa9fbe8678))
* **today:** migrate /today page from MD parsers to Supabase ([920f7fb](https://github.com/dielamb/career-ops/commit/920f7fb69abcd28a2190a5cb9ac82b87ab8ae542))
* **ui:** hide admin-only UI surfaces for non-admin users ([7a2249c](https://github.com/dielamb/career-ops/commit/7a2249c1e3d23830e058d0bb457c1b728c82565b))


### Bug Fixes

* **05-pages-e2e-03:** apply-flow spec â use real pipeline rows, wildcard listing mock\n\n- /pipeline is a server component calling parsePipeline() directly (no SSR fetch)\n  so page.route('**/api/pipeline') has no effect on server render\n- Switch to locating first real pipeline row with [data-testid^='pipeline-row-'] \n- Mock all /api/listing/** with wildcard to cover any real row id\n- Relax applyPayload assertion to check url is truthy (url comes from real data)\n- All 4 E2E tests now pass (smoke + apply-flow + mark-sent-lock + malformed-md)\n ([ee77ffe](https://github.com/dielamb/career-ops/commit/ee77ffed904bd101798ca2c3cb82f37e25bf9575))
* **auth/billing:** signup redirect, OAuth race, post-payment landing ([434eee8](https://github.com/dielamb/career-ops/commit/434eee8700af92b2c22dba77c02b564d676340d0))
* **auth:** resolve TS readonly tuple in pixelBootUp, add useReducedMotion, fix focus-visible indicators ([5c5a44b](https://github.com/dielamb/career-ops/commit/5c5a44b9401942b4ee5f21b75d877870e1e4b272))
* **auth:** responsive pills — vertical stack on mobile, horizontal on desktop ([bba5c6c](https://github.com/dielamb/career-ops/commit/bba5c6c62fbb65620df26044ad3d5c1a26ae5e8a))
* **auth:** router.refresh() before push, add error handling to handleGoogleOAuth ([33251d6](https://github.com/dielamb/career-ops/commit/33251d6f3d41165e3a260d2258142ae56a46e375))
* **billing/auth:** sidebar counter, BYOK informational counter, OAuth error surfacing ([0044e39](https://github.com/dielamb/career-ops/commit/0044e39ddd2817188bd7f146a7539aeac3755d9a))
* **billing:** re-enable Stripe Pro checkout for all users ([1ea7e09](https://github.com/dielamb/career-ops/commit/1ea7e0987004c2ff03b285afb75bfdb94ce29503))
* **cv-pdf:** fallback to pdf-parse when Claude API has no credits ([8ec8636](https://github.com/dielamb/career-ops/commit/8ec86362b22d46bcb8e556f800b63087e721ec34))
* **cv-pdf:** use any cast for document block, delete stale .next/types ([ef79094](https://github.com/dielamb/career-ops/commit/ef790941f0177602185b8cac2a4d5f53c32bab1d))
* **cv-pdf:** use pdf-parse 1.1.1 CJS require, fix TS2349 ([deed715](https://github.com/dielamb/career-ops/commit/deed7152fac6b95e6f56f524a2e2b516bdf35941))
* **dashboard:** dismiss scans, reorder, revert-to-Evaluated ([e02915d](https://github.com/dielamb/career-ops/commit/e02915d227241f664a7becd7d4861070c5943451))
* **dashboard:** mark-sent now reflects in /pipeline view, persist contacts/cover ([f08dd56](https://github.com/dielamb/career-ops/commit/f08dd56e808be71b34f7eac01db2a8b77cce3411))
* **dashboard:** review findings - valid HTML, Zod parse, status Record ([de1ec11](https://github.com/dielamb/career-ops/commit/de1ec11e4074bafcfc61cb0d90cbb1e4f2be27d0))
* **dashboard:** right pane = original JD, env -u API_KEY for claude spawns, elapsed timers ([200036b](https://github.com/dielamb/career-ops/commit/200036bee4f6d0e4ff7285555b1a1430a0a17f59))
* **dashboard:** scan progress visibility + claude env hygiene ([c6e19db](https://github.com/dielamb/career-ops/commit/c6e19dbec70f96e4bd4604f3c9a2302b95a8f15b))
* **dashboard:** sidebar active state, Top 5 [Open] → /pipeline?id, Reports + Settings stub pages ([94f6173](https://github.com/dielamb/career-ops/commit/94f6173ee69d3f51af6aa2934b23db5e6ff9af7c))
* **dashboard:** sidebar sticky, card click area, status pill, MD recommendation ([4d5c0dd](https://github.com/dielamb/career-ops/commit/4d5c0ddda261cbbb344486dcf40f6ef87dac1312))
* **dashboard:** width-aware Markdown rendering with table wrapping in viewer ([#513](https://github.com/dielamb/career-ops/issues/513)) ([dc3a247](https://github.com/dielamb/career-ops/commit/dc3a247733d9fb7eb7159836bed743a587231192))
* evalDate not on PipelineEntry; add EventEmitter import in test ([065790e](https://github.com/dielamb/career-ops/commit/065790e59a3204614cfa72c99b8e473d8df6d9db))
* **intake/ui:** dedup re-pasted URLs + live-refresh sidebar counter ([1c270d6](https://github.com/dielamb/career-ops/commit/1c270d6b688c8e386f18b7e297d3d1b4b21728e9))
* **pdf:** add serverExternalPackages for pdf-parse (Next.js webpack bypass) ([2abc9eb](https://github.com/dielamb/career-ops/commit/2abc9ebe99b3cdbee7af2616663cf479b90896a0))
* **qa:** ISSUE-001 — sign-up link broken (404), add inline signup mode toggle ([982a5eb](https://github.com/dielamb/career-ops/commit/982a5eb6e9eb2d7be3fb16978d14c1d13cdef3b0))
* **qa:** ISSUE-002 — API routes return HTML redirect instead of 401 JSON ([0c794c6](https://github.com/dielamb/career-ops/commit/0c794c6775a6ef4b09d1426030626adebd48a1e0))
* **release:** sync VERSION file to 1.8.0 ([541917f](https://github.com/dielamb/career-ops/commit/541917f627f3f328e5411a54685f5e8706761499))
* remove double cd in vercel.json â root dir already set to dashboard/web ([72bf05c](https://github.com/dielamb/career-ops/commit/72bf05cbb7baacd12b403bcc9bd2bb332e7c4efc))
* resolve vercel.json merge conflict â keep correct commands without cd prefix ([cf15c32](https://github.com/dielamb/career-ops/commit/cf15c32ae8f837a1d00a47705266fc015d59ef56))
* **scan:** bootstrap providers/ on update + harden greenhouse detect() ([#696](https://github.com/dielamb/career-ops/issues/696)) ([4b12081](https://github.com/dielamb/career-ops/commit/4b120817fc1a07d4664ff764bf2a1c51e443b524))
* **security:** gate filesystem-backed routes to admin emails (Phase 0) ([2ea9eb2](https://github.com/dielamb/career-ops/commit/2ea9eb2dc4ffa802408286db07ea9c6cee095f87))
* **update-system:** apply() safety violation reverts cleanly and releases lock ([#484](https://github.com/dielamb/career-ops/issues/484)) ([980153c](https://github.com/dielamb/career-ops/commit/980153c315ec3fbbe6f9195c77d2f865b5a2e1a0))
* **update-system:** bootstrap liveness-browser.mjs for v1.7→v1.8 upgrades ([#725](https://github.com/dielamb/career-ops/issues/725)) ([1ea95f2](https://github.com/dielamb/career-ops/commit/1ea95f293e742945fb4ba9befee4db8c50df6d2f)), closes [#704](https://github.com/dielamb/career-ops/issues/704)
* **update-system:** rollback() removes paths absent from backup branch ([#483](https://github.com/dielamb/career-ops/issues/483)) ([f94a3be](https://github.com/dielamb/career-ops/commit/f94a3be25890d83ee2664175bbe1bebf1f3eb033))

## [1.8.0](https://github.com/santifer/career-ops/compare/career-ops-v1.7.1...career-ops-v1.8.0) (2026-05-15)


### Features

* **scan:** optional location_filter in portals.yml + persist location to scan-history ([#570](https://github.com/santifer/career-ops/issues/570)) ([d692647](https://github.com/santifer/career-ops/commit/d692647c253a0bf92a4f9f3b8043afe2c8161853))


### Bug Fixes

* **batch:** workers read modes/_profile.md and config/profile.yml ([#537](https://github.com/santifer/career-ops/issues/537)) ([150e223](https://github.com/santifer/career-ops/commit/150e223ba679246a378e7815da95b6b6d1c5e6ad)), closes [#534](https://github.com/santifer/career-ops/issues/534)
* **deps:** update dotenv to v17 ([#499](https://github.com/santifer/career-ops/issues/499)) ([ce1330e](https://github.com/santifer/career-ops/commit/ce1330efc45e9da462e81ccce3d5f27db9f8a623))
* **gemini-eval:** include profile.yml and _profile.md in evaluation ([#618](https://github.com/santifer/career-ops/issues/618)) ([73dc603](https://github.com/santifer/career-ops/commit/73dc6038d2e723997426d73d3a0c5040c48dd033)), closes [#617](https://github.com/santifer/career-ops/issues/617)
* **gemini-eval:** redact API key from error logs, harden summary parsing ([#582](https://github.com/santifer/career-ops/issues/582)) ([fdca4de](https://github.com/santifer/career-ops/commit/fdca4ded87e1dbde0571fe740da061da491f46c7))
* **gemini-eval:** switch default model to non-deprecated endpoint, surface 429 guidance ([#615](https://github.com/santifer/career-ops/issues/615)) ([dd3e036](https://github.com/santifer/career-ops/commit/dd3e0366d26719af7be234786a16512f46ac9e85)), closes [#614](https://github.com/santifer/career-ops/issues/614)
* **manifest:** align plugin.json skills field with Claude Code plugin schema ([#612](https://github.com/santifer/career-ops/issues/612)) ([a77d3f6](https://github.com/santifer/career-ops/commit/a77d3f6aa3f5c278665c95c5a12048e4df66d337))
* **merge-tracker:** preserve short specialty acronyms, require non-baseline overlap ([#634](https://github.com/santifer/career-ops/issues/634)) ([5ed3b3d](https://github.com/santifer/career-ops/commit/5ed3b3d7ea693547153ef734ab5f6016414c3301)), closes [#633](https://github.com/santifer/career-ops/issues/633)
* **modes:** make /career-ops deep respect user language, not JD language ([#568](https://github.com/santifer/career-ops/issues/568)) ([e5f0508](https://github.com/santifer/career-ops/commit/e5f0508b94299a0e6b46918ecca2f483de0a58c6))
* **portals:** update Weights & Biases entry to CoreWeave acquisition ([#493](https://github.com/santifer/career-ops/issues/493)) ([1411cdc](https://github.com/santifer/career-ops/commit/1411cdc461de05a6772c854188053bcaeeb4ee32))
* **release:** sync VERSION file to 1.7.1 ([2ebfcab](https://github.com/santifer/career-ops/commit/2ebfcabdb4cf7973e279e56f8eae001a8dadc5ed))
* **scan:** validate Greenhouse URL hostname against allowlist to prevent SSRF ([#602](https://github.com/santifer/career-ops/issues/602)) ([988f7bb](https://github.com/santifer/career-ops/commit/988f7bb2a642f91d6cce1e2fc94f08658b72e099))
* **templates:** align CV certification rows on a 3-column grid ([#638](https://github.com/santifer/career-ops/issues/638)) ([082cd11](https://github.com/santifer/career-ops/commit/082cd11c32b917fe3aeef709ff4f386371af3e64))
* **update-system:** allow writing-samples/README.md as system-owned file ([#562](https://github.com/santifer/career-ops/issues/562)) ([207fd07](https://github.com/santifer/career-ops/commit/207fd076da3b2a30f0384fdb19312078ebdcf71f))
* **update-system:** bootstrap .agents/ for v1.6→v1.7 migration ([#654](https://github.com/santifer/career-ops/issues/654)) ([4714504](https://github.com/santifer/career-ops/commit/47145048716d3716a2f1cb0b46377a88e5df73c0))
* **update-system:** defensive VERSION parsing for release-please marker ([#547](https://github.com/santifer/career-ops/issues/547)) ([bf84886](https://github.com/santifer/career-ops/commit/bf848860cb2c7976f6e77e1b5d7b60ed5e9d0d14))

## [1.7.1](https://github.com/santifer/career-ops/compare/career-ops-v1.7.0...career-ops-v1.7.1) (2026-05-12)


### Bug Fixes

* **release:** sync VERSION file to 1.7.0 ([8e554cc](https://github.com/santifer/career-ops/commit/8e554cc4437c3a58e813378abb9b35e2e08a007e))
* **update-system:** include .agents/ in SYSTEM_PATHS ([#600](https://github.com/santifer/career-ops/issues/600)) ([3a71469](https://github.com/santifer/career-ops/commit/3a714695c63ca01a6581b4307885be2055319784))

## [1.7.0](https://github.com/santifer/career-ops/compare/career-ops-v1.6.0...career-ops-v1.7.0) (2026-05-06)


### Features

* adapt contacto mode by contact type (recruiter/HM/peer/interviewer) ([9fd5a90](https://github.com/santifer/career-ops/commit/9fd5a90896f20020f48455cd079b64fed491b89f))
* add --min-score flag to batch runner ([#249](https://github.com/santifer/career-ops/issues/249)) ([cb0c7f7](https://github.com/santifer/career-ops/commit/cb0c7f7d7d3b9f3f1c3dc75ccac0a08d2737c01e))
* add {{PHONE}} placeholder to CV template ([#287](https://github.com/santifer/career-ops/issues/287)) ([e71595f](https://github.com/santifer/career-ops/commit/e71595f8ba134971ecf1cc3c3420d9caf21eed43))
* add Block G — posting legitimacy assessment ([3a636ac](https://github.com/santifer/career-ops/commit/3a636ac586659bb798ef46a0a9798478a1e28b0a))
* add Claude Code plugin manifests (path-stable) ([62b767d](https://github.com/santifer/career-ops/commit/62b767dcc56e4c875ed70bf4fe799c254ecf8eea))
* add follow-up cadence tracker mode ([4308c37](https://github.com/santifer/career-ops/commit/4308c375033c6df430308235f4324658a8353b81))
* add Gemini CLI native integration and evaluator script  ([#349](https://github.com/santifer/career-ops/issues/349)) ([0853486](https://github.com/santifer/career-ops/commit/0853486d2c01a35adafea2cc6b6d8c429b843588))
* add Gemini CLI native integration and evaluator script (closes [#344](https://github.com/santifer/career-ops/issues/344)) ([0853486](https://github.com/santifer/career-ops/commit/0853486d2c01a35adafea2cc6b6d8c429b843588))
* add GitHub Actions CI + auto-labeler + welcome bot + /run skill ([2ddf22a](https://github.com/santifer/career-ops/commit/2ddf22a6a2731b38bcaed5786c4855c4ab9fe722))
* add LaTeX/Overleaf CV export mode with pdflatex compilation ([#362](https://github.com/santifer/career-ops/issues/362)) ([b824953](https://github.com/santifer/career-ops/commit/b824953d0e3b7f8c6105dfcce7e17257c95ce6cd))
* add LaTeX/Overleaf CV export mode with pdflatex compilation (closes [#47](https://github.com/santifer/career-ops/issues/47)) ([b824953](https://github.com/santifer/career-ops/commit/b824953d0e3b7f8c6105dfcce7e17257c95ce6cd))
* add Nix flake devshell with Playwright support ([c579fcd](https://github.com/santifer/career-ops/commit/c579fcddebf793f00cfad8534fd74085c09017fb))
* add OpenCode slash commands for career-ops ([#67](https://github.com/santifer/career-ops/issues/67)) ([93caaed](https://github.com/santifer/career-ops/commit/93caaed49cbc9f3214f9beb66fb2281c3f2370e6))
* add scan.mjs — zero-token portal scanner ([8c19b2b](https://github.com/santifer/career-ops/commit/8c19b2b59f7087689e004f3d48e912f291911373))
* add writing-samples folder for AI-detection-evading voice calibration ([9ae201d](https://github.com/santifer/career-ops/commit/9ae201d0682a17e7006ed7902b42db8234212e97))
* **cv:** add cv.output_format to route between html and latex generation ([b82bb5f](https://github.com/santifer/career-ops/commit/b82bb5fb7c86ab3074a54eaf0f3186f81d41f417))
* **dashboard:** add Catppuccin Latte light theme with auto-detection ([ff686c8](https://github.com/santifer/career-ops/commit/ff686c8af97a7bf93565fe8eeac677f998cc9ece))
* **dashboard:** add manual refresh shortcut ([#246](https://github.com/santifer/career-ops/issues/246)) ([4b5093a](https://github.com/santifer/career-ops/commit/4b5093a8ef1733c449ec0821f722f996625fcb84))
* **dashboard:** add progress analytics screen ([623c837](https://github.com/santifer/career-ops/commit/623c837bf3155fd5b7413554240071d40585dd7e))
* **dashboard:** add rejected and discarded pipeline tabs ([7d05967](https://github.com/santifer/career-ops/commit/7d05967389fb6185f0d6e566a4ba583ee3824e1e))
* **dashboard:** add vim motions to pipeline screen ([#262](https://github.com/santifer/career-ops/issues/262)) ([d149e54](https://github.com/santifer/career-ops/commit/d149e541402db0c88161a71c73899cd1836a1b2d))
* **dashboard:** aligned tables and markdown syntax rendering in viewer ([dbd1d3f](https://github.com/santifer/career-ops/commit/dbd1d3f7177358d0384d6e661d1b0dfc1f60bd4e))
* **dashboard:** show tracker IDs in pipeline list ([8d289c6](https://github.com/santifer/career-ops/commit/8d289c64e31f81cf447f75105b500d1feca21058))
* expand portals.example.yml with 8 dev-tools companies + 23 search queries ([#140](https://github.com/santifer/career-ops/issues/140)) ([b7f555d](https://github.com/santifer/career-ops/commit/b7f555d7b9a7b23c875fa0d35584df534961dabe))
* **i18n:** add Japanese README + language modes for Japan market ([20a2c81](https://github.com/santifer/career-ops/commit/20a2c817486968ca42a534aa86838c797d599c10))
* **latex:** add tectonic engine auto-detect with pdflatex fallback ([4b71b2c](https://github.com/santifer/career-ops/commit/4b71b2cbf4fd49d3882cdd8767e31727337fab34))
* multi-CLI support via open agent skill standard ([#572](https://github.com/santifer/career-ops/issues/572)) ([7605a5e](https://github.com/santifer/career-ops/commit/7605a5ed68d0fd559374afec1cd8798c487e3ead))
* **portals:** add Canada/Vancouver and automation companies to example template ([590ba6e](https://github.com/santifer/career-ops/commit/590ba6e1b4b9d2d9d03893b7f5fdae920d4f9a0b))


### Bug Fixes

* 10 bug fixes — resource leaks, command injection, Unicode, navigation ([cb01a2c](https://github.com/santifer/career-ops/commit/cb01a2c2e3b7fc334b1c4594749ea40b0da8fc62))
* add data/ fallback to UpdateApplicationStatus ([#55](https://github.com/santifer/career-ops/issues/55)) ([3512b8e](https://github.com/santifer/career-ops/commit/3512b8ef4eb8ca967bc967664f8798af42b58a52))
* add stopword filtering and overlap ratio to roleMatch ([#248](https://github.com/santifer/career-ops/issues/248)) ([4da772d](https://github.com/santifer/career-ops/commit/4da772d3a4996bc9ecbe2d384d1e9d2ed75b9819))
* align portals.example.yml indentation for new companies ([26a6751](https://github.com/santifer/career-ops/commit/26a675173e64dac09fd1524ff9a7c7061520e057))
* **ci:** correct first-interaction@v3 input names ([c5196a8](https://github.com/santifer/career-ops/commit/c5196a8dd8ff05da51c72ea151f67e481f12c329))
* **ci:** gracefully handle missing dependency graph in dependency-review ([#343](https://github.com/santifer/career-ops/issues/343)) ([7c5fecb](https://github.com/santifer/career-ops/commit/7c5fecb00d60521f77b33724eb345a28257d8832))
* **ci:** gracefully handle missing dependency graph in dependency-review workflow ([#352](https://github.com/santifer/career-ops/issues/352)) ([7c5fecb](https://github.com/santifer/career-ops/commit/7c5fecb00d60521f77b33724eb345a28257d8832))
* **ci:** use pull_request_target for labeler on fork PRs ([#260](https://github.com/santifer/career-ops/issues/260)) ([2ecf572](https://github.com/santifer/career-ops/commit/2ecf57206c2eb6e35e2a843d6b8365f7a04c53d6))
* correct _shared.md → _profile.md reference in CUSTOMIZATION.md (closes [#137](https://github.com/santifer/career-ops/issues/137)) ([a91e264](https://github.com/santifer/career-ops/commit/a91e264b6ea047a76d8c033aa564fe01b8f9c1d9))
* correct dashboard launch path in docs ([#80](https://github.com/santifer/career-ops/issues/80)) ([2b969ee](https://github.com/santifer/career-ops/commit/2b969eea5f6bbc8f29b9e42bedb59312379e9f02))
* **dashboard:** show dates in pipeline list ([#298](https://github.com/santifer/career-ops/issues/298)) ([e5e2a6c](https://github.com/santifer/career-ops/commit/e5e2a6cffe9a5b9f3cec862df25410d02ecc9aa4))
* ensure data/ and output/ dirs exist before writing in scripts ([#261](https://github.com/santifer/career-ops/issues/261)) ([4b834f6](https://github.com/santifer/career-ops/commit/4b834f6f7f8f1b647a6bf76e43b017dcbe9cd52f))
* filter expired WebSearch links before they reach the pipeline ([#57](https://github.com/santifer/career-ops/issues/57)) ([ce1c5a3](https://github.com/santifer/career-ops/commit/ce1c5a3c7eea6ebce2c90aebba59d6e26b790d3f))
* improve default PDF readability ([#85](https://github.com/santifer/career-ops/issues/85)) ([10034ec](https://github.com/santifer/career-ops/commit/10034ec3304c1c79ff9c9678c7826ab77c0bcbf7))
* liveness checks ignore nav/footer Apply text, expired signals win ([3a3cb95](https://github.com/santifer/career-ops/commit/3a3cb95bdf09235509df72e30b3077623f571ea1))
* **liveness:** detect closed postings with applications-closed banner variants ([7f8217e](https://github.com/santifer/career-ops/commit/7f8217e057b327980a797a682c4f01d3318edbbe))
* **merge-tracker:** filter seniority and location stopwords + require overlap ratio in roleFuzzyMatch ([7821113](https://github.com/santifer/career-ops/commit/7821113261eeb32f99639ff076651ab2e7757209))
* **pt:** restore diacritical marks in PT-BR modes ([#358](https://github.com/santifer/career-ops/issues/358)) ([3a4c596](https://github.com/santifer/career-ops/commit/3a4c596cb0a522f562ba38b35c210facaf38a503))
* **pt:** restore diacritical marks in PT-BR modes ([#359](https://github.com/santifer/career-ops/issues/359)) ([3a4c596](https://github.com/santifer/career-ops/commit/3a4c596cb0a522f562ba38b35c210facaf38a503))
* **release:** sync VERSION and package.json via release-please-config ([6a3dc22](https://github.com/santifer/career-ops/commit/6a3dc224337a1942bf2ebf18b9b275d94fc06e7a))
* remove wellfound, lever and remotefront from portals.example.yml ([#286](https://github.com/santifer/career-ops/issues/286)) ([ecd013c](https://github.com/santifer/career-ops/commit/ecd013cc6f59e3a1a8ef77d34e7abc15e8075ed3))
* replace grep -P with POSIX-compatible grep in batch-runner.sh ([637b39e](https://github.com/santifer/career-ops/commit/637b39e383d1174c8287f42e9534e9e3cdfabb19))
* test-all.mjs scans only git-tracked files, avoids false positives ([47c9f98](https://github.com/santifer/career-ops/commit/47c9f984d8ddc70974f15c99b081667b73f1bb9a))
* **update-system:** cross-check GitHub Releases API when VERSION file is stale ([b0ee6eb](https://github.com/santifer/career-ops/commit/b0ee6ebfcec7920ea7590ada61f3c39324d22ebc))
* **update-system:** expand SYSTEM_PATHS to cover all language modes and current scripts ([34fe3fb](https://github.com/santifer/career-ops/commit/34fe3fbd5782f7f57faf8ef4a245fbee6275a040))
* use candidate name from profile.yml in PDF filename ([7bcbc08](https://github.com/santifer/career-ops/commit/7bcbc08ca6184362398690234e49df0ac157567f))
* use execFileSync to prevent shell injection in test-all.mjs ([c99d5a6](https://github.com/santifer/career-ops/commit/c99d5a6526f923b56c3790b79b0349f402fa00e2))
* use fileURLToPath for cross platform compatible paths in tracker scripts ([#32](https://github.com/santifer/career-ops/issues/32)) ([#58](https://github.com/santifer/career-ops/issues/58)) ([ab77510](https://github.com/santifer/career-ops/commit/ab775102f4586ae4663a593b519927531be27122))
* use hi@santifer.io in English README ([5518d3d](https://github.com/santifer/career-ops/commit/5518d3dd07716137b97bb4d8c7b5264b94e2b9e9))


### Performance Improvements

* compress hero banner from 5.7MB to 671KB ([dac4259](https://github.com/santifer/career-ops/commit/dac425913620fe0a66916dda7ba8d8fc4c427d51))

## [1.6.0](https://github.com/santifer/career-ops/compare/v1.5.0...v1.6.0) (2026-04-26)


### Features

* add Gemini CLI native integration and evaluator script  ([#349](https://github.com/santifer/career-ops/issues/349)) ([0853486](https://github.com/santifer/career-ops/commit/0853486d2c01a35adafea2cc6b6d8c429b843588))
* add Gemini CLI native integration and evaluator script (closes [#344](https://github.com/santifer/career-ops/issues/344)) ([0853486](https://github.com/santifer/career-ops/commit/0853486d2c01a35adafea2cc6b6d8c429b843588))
* add LaTeX/Overleaf CV export mode with pdflatex compilation ([#362](https://github.com/santifer/career-ops/issues/362)) ([b824953](https://github.com/santifer/career-ops/commit/b824953d0e3b7f8c6105dfcce7e17257c95ce6cd))
* add LaTeX/Overleaf CV export mode with pdflatex compilation (closes [#47](https://github.com/santifer/career-ops/issues/47)) ([b824953](https://github.com/santifer/career-ops/commit/b824953d0e3b7f8c6105dfcce7e17257c95ce6cd))
* **cv:** add cv.output_format to route between html and latex generation ([b82bb5f](https://github.com/santifer/career-ops/commit/b82bb5fb7c86ab3074a54eaf0f3186f81d41f417))
* **dashboard:** add rejected and discarded pipeline tabs ([7d05967](https://github.com/santifer/career-ops/commit/7d05967389fb6185f0d6e566a4ba583ee3824e1e))
* **dashboard:** show tracker IDs in pipeline list ([8d289c6](https://github.com/santifer/career-ops/commit/8d289c64e31f81cf447f75105b500d1feca21058))
* **latex:** add tectonic engine auto-detect with pdflatex fallback ([4b71b2c](https://github.com/santifer/career-ops/commit/4b71b2cbf4fd49d3882cdd8767e31727337fab34))
* **portals:** add Canada/Vancouver and automation companies to example template ([590ba6e](https://github.com/santifer/career-ops/commit/590ba6e1b4b9d2d9d03893b7f5fdae920d4f9a0b))


### Bug Fixes

* **ci:** correct first-interaction@v3 input names ([c5196a8](https://github.com/santifer/career-ops/commit/c5196a8dd8ff05da51c72ea151f67e481f12c329))
* **ci:** gracefully handle missing dependency graph in dependency-review ([#343](https://github.com/santifer/career-ops/issues/343)) ([7c5fecb](https://github.com/santifer/career-ops/commit/7c5fecb00d60521f77b33724eb345a28257d8832))
* **ci:** gracefully handle missing dependency graph in dependency-review workflow ([#352](https://github.com/santifer/career-ops/issues/352)) ([7c5fecb](https://github.com/santifer/career-ops/commit/7c5fecb00d60521f77b33724eb345a28257d8832))
* **liveness:** detect closed postings with applications-closed banner variants ([7f8217e](https://github.com/santifer/career-ops/commit/7f8217e057b327980a797a682c4f01d3318edbbe))
* **merge-tracker:** filter seniority and location stopwords + require overlap ratio in roleFuzzyMatch ([7821113](https://github.com/santifer/career-ops/commit/7821113261eeb32f99639ff076651ab2e7757209))
* **pt:** restore diacritical marks in PT-BR modes ([#358](https://github.com/santifer/career-ops/issues/358)) ([3a4c596](https://github.com/santifer/career-ops/commit/3a4c596cb0a522f562ba38b35c210facaf38a503))
* **pt:** restore diacritical marks in PT-BR modes ([#359](https://github.com/santifer/career-ops/issues/359)) ([3a4c596](https://github.com/santifer/career-ops/commit/3a4c596cb0a522f562ba38b35c210facaf38a503))
* **update-system:** cross-check GitHub Releases API when VERSION file is stale ([b0ee6eb](https://github.com/santifer/career-ops/commit/b0ee6ebfcec7920ea7590ada61f3c39324d22ebc))
* **update-system:** expand SYSTEM_PATHS to cover all language modes and current scripts ([34fe3fb](https://github.com/santifer/career-ops/commit/34fe3fbd5782f7f57faf8ef4a245fbee6275a040))

## [1.5.0](https://github.com/santifer/career-ops/compare/v1.4.0...v1.5.0) (2026-04-14)


### Features

* add --min-score flag to batch runner ([#249](https://github.com/santifer/career-ops/issues/249)) ([cb0c7f7](https://github.com/santifer/career-ops/commit/cb0c7f7d7d3b9f3f1c3dc75ccac0a08d2737c01e))
* add {{PHONE}} placeholder to CV template ([#287](https://github.com/santifer/career-ops/issues/287)) ([e71595f](https://github.com/santifer/career-ops/commit/e71595f8ba134971ecf1cc3c3420d9caf21eed43))
* **dashboard:** add manual refresh shortcut ([#246](https://github.com/santifer/career-ops/issues/246)) ([4b5093a](https://github.com/santifer/career-ops/commit/4b5093a8ef1733c449ec0821f722f996625fcb84))


### Bug Fixes

* add stopword filtering and overlap ratio to roleMatch ([#248](https://github.com/santifer/career-ops/issues/248)) ([4da772d](https://github.com/santifer/career-ops/commit/4da772d3a4996bc9ecbe2d384d1e9d2ed75b9819))
* **dashboard:** show dates in pipeline list ([#298](https://github.com/santifer/career-ops/issues/298)) ([e5e2a6c](https://github.com/santifer/career-ops/commit/e5e2a6cffe9a5b9f3cec862df25410d02ecc9aa4))
* ensure data/ and output/ dirs exist before writing in scripts ([#261](https://github.com/santifer/career-ops/issues/261)) ([4b834f6](https://github.com/santifer/career-ops/commit/4b834f6f7f8f1b647a6bf76e43b017dcbe9cd52f))
* remove wellfound, lever and remotefront from portals.example.yml ([#286](https://github.com/santifer/career-ops/issues/286)) ([ecd013c](https://github.com/santifer/career-ops/commit/ecd013cc6f59e3a1a8ef77d34e7abc15e8075ed3))

## [1.4.0](https://github.com/santifer/career-ops/compare/v1.3.0...v1.4.0) (2026-04-13)


### Features

* add GitHub Actions CI + auto-labeler + welcome bot + /run skill ([2ddf22a](https://github.com/santifer/career-ops/commit/2ddf22a6a2731b38bcaed5786c4855c4ab9fe722))
* **dashboard:** add Catppuccin Latte light theme with auto-detection ([ff686c8](https://github.com/santifer/career-ops/commit/ff686c8af97a7bf93565fe8eeac677f998cc9ece))
* **dashboard:** add progress analytics screen ([623c837](https://github.com/santifer/career-ops/commit/623c837bf3155fd5b7413554240071d40585dd7e))
* **dashboard:** add vim motions to pipeline screen ([#262](https://github.com/santifer/career-ops/issues/262)) ([d149e54](https://github.com/santifer/career-ops/commit/d149e541402db0c88161a71c73899cd1836a1b2d))
* **dashboard:** aligned tables and markdown syntax rendering in viewer ([dbd1d3f](https://github.com/santifer/career-ops/commit/dbd1d3f7177358d0384d6e661d1b0dfc1f60bd4e))


### Bug Fixes

* **ci:** use pull_request_target for labeler on fork PRs ([#260](https://github.com/santifer/career-ops/issues/260)) ([2ecf572](https://github.com/santifer/career-ops/commit/2ecf57206c2eb6e35e2a843d6b8365f7a04c53d6))
* correct _shared.md → _profile.md reference in CUSTOMIZATION.md (closes [#137](https://github.com/santifer/career-ops/issues/137)) ([a91e264](https://github.com/santifer/career-ops/commit/a91e264b6ea047a76d8c033aa564fe01b8f9c1d9))
* replace grep -P with POSIX-compatible grep in batch-runner.sh ([637b39e](https://github.com/santifer/career-ops/commit/637b39e383d1174c8287f42e9534e9e3cdfabb19))
* test-all.mjs scans only git-tracked files, avoids false positives ([47c9f98](https://github.com/santifer/career-ops/commit/47c9f984d8ddc70974f15c99b081667b73f1bb9a))
* use execFileSync to prevent shell injection in test-all.mjs ([c99d5a6](https://github.com/santifer/career-ops/commit/c99d5a6526f923b56c3790b79b0349f402fa00e2))
