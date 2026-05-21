import Link from 'next/link';

export interface SidebarNavItem {
  href: string;
  label: string;
  active: boolean;
  enabled: boolean;
}

export interface SidebarProps {
  items: SidebarNavItem[];
  /** Brand line shown above nav (e.g. "career-ops"). */
  brand?: string;
  /** Optional content rendered below nav items (e.g. AddUrlWidget). */
  footer?: React.ReactNode;
}

const ACTIVE_CLASSES =
  // Y2K signature on active item per DESIGN.md: acid background + ink border + offset shadow
  'bg-acid text-ink border-[2.5px] border-ink shadow-[4px_4px_0_var(--color-ink)] font-mono font-semibold';
const ENABLED_INACTIVE_CLASSES =
  'bg-paper text-ink border-[2.5px] border-ink hover:bg-cyber font-mono font-semibold';
const DISABLED_CLASSES =
  'bg-transparent text-ink-dim border-[2.5px] border-chrome font-mono italic cursor-not-allowed';

export function Sidebar({ items, brand = 'career-ops', footer }: SidebarProps) {
  return (
    <aside
      data-testid="sidebar"
      aria-label="Primary"
      className="w-[240px] shrink-0 bg-bg p-lg flex flex-col gap-md border-r-[2.5px] border-ink min-h-screen"
    >
      <header className="mb-xl">
        <span
          className="inline-block font-display font-extrabold text-2xl text-ink"
          style={{ fontVariationSettings: '"wdth" 60' }}
        >
          {brand}
        </span>
        <span
          className="inline-block ml-xs px-2 py-1 bg-magenta text-ink font-mono text-xs uppercase"
          style={{ transform: 'rotate(-2deg)' }}
          aria-hidden="true"
        >
          Y2K
        </span>
      </header>
      <nav className="flex flex-col gap-sm">
        {items.map((item) => {
          const className = item.active
            ? ACTIVE_CLASSES
            : item.enabled
              ? ENABLED_INACTIVE_CLASSES
              : DISABLED_CLASSES;
          const common = `block px-md py-sm text-sm uppercase tracking-wider rounded-none ${className}`;
          if (!item.enabled) {
            return (
              <span
                key={item.label}
                data-testid={`sidebar-item-${item.label.toLowerCase()}`}
                data-disabled="true"
                aria-disabled="true"
                className={common}
              >
                {item.label}
              </span>
            );
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              data-testid={`sidebar-item-${item.label.toLowerCase()}`}
              data-active={item.active ? 'true' : 'false'}
              aria-current={item.active ? 'page' : undefined}
              className={common}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {footer}
    </aside>
  );
}
