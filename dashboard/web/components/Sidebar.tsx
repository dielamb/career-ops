'use client';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Sidebar as RawSidebar, type SidebarNavItem } from './raw/Sidebar';
import { AddUrlWidget } from './AddUrlWidget';
import { UsageMeter } from './UsageMeter';
import { fadeUp } from '@/lib/motion-presets';

export function Sidebar() {
  const pathname = usePathname() ?? '/';

  // /reports still reads admin's local MD files (gated by middleware) and a
  // per-user replacement won't ship until the scan→listings flow is migrated.
  // Hide the nav link in the meantime so non-admin users don't see a broken
  // entry; admin can still reach it by typing the URL directly.
  const items: SidebarNavItem[] = [
    { href: '/',         label: 'Today',    active: pathname === '/',                 enabled: true },
    { href: '/pipeline', label: 'Pipeline', active: pathname.startsWith('/pipeline'), enabled: true },
    { href: '/settings', label: 'Settings', active: pathname.startsWith('/settings'), enabled: true },
    { href: '/billing',  label: 'Billing',  active: pathname.startsWith('/billing'),  enabled: true },
  ];

  return (
    <motion.div
      data-testid="motion-sidebar"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={fadeUp.transition}
    >
      <RawSidebar
        items={items}
        footer={
          <>
            <UsageMeter />
            <AddUrlWidget />
          </>
        }
      />
    </motion.div>
  );
}
