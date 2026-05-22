# Changelog — career-ops dashboard

## [0.2.0] - 2026-05-21

### Added
- Auth page (`/auth`) — Y2K Maximalist design: two-column layout (60/40), brand panel with 3 USPs + EVALUATE·APPLY·HIRED pipeline pills + 5 decorative SVG shapes, form card with // SIGN IN inverted bar header, email/password inputs, CONTINUE button, Google OAuth button (stubs — Supabase integration pending)
- Next.js Route Groups — `app/(main)/layout.tsx` wraps dashboard routes with sidebar; `app/auth/` excluded from sidebar layout

### Changed
- Root `app/layout.tsx` stripped to bare html/body + fonts + ToastProvider shell (sidebar moved to route group)
- Existing pages moved to `app/(main)/` — URLs unchanged

### Fixed
- Motion presets (`pixelBootUp`): readonly tuple type error resolved — mutable `number[]` cast
- Auth page: `useReducedMotion()` hook added — animations respect OS reduced-motion preference
- Auth page: `focus-visible` rings added to all interactive elements (cyan, WCAG 2.4.7 AA)
- Auth page: responsive pills — vertical stack on mobile (390px), horizontal with dots on desktop

## [0.1.0] - 2026-05-20

### Added
- Initial dashboard: /today hero, /pipeline with filters + ListingModal, /reports, /settings
- Active Scans widget, Cmd+K command palette, Quick Add URL sidebar widget
- Run Scan button + Toast notification system
- 50 unit tests (Vitest), 4 E2E specs (Playwright)
- Y2K Maximalist design system (Bricolage Grotesque + General Sans + IBM Plex Mono)
