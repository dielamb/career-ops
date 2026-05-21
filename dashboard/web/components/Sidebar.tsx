'use client';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Sidebar as RawSidebar, type SidebarNavItem } from './raw/Sidebar';
import { fadeUp } from '@/lib/motion-presets';

/**
 * Client-side Sidebar: derives active nav item from `usePathname()` (next/navigation).
 * Renders Today / Pipeline as enabled+route-aware; Reports / Settings as enabled stub pages.
 */
export function Sidebar() {
  const pathname = usePathname() ?? '/';

  const items: SidebarNavItem[] = [
    { href: '/',         label: 'Today',    active: pathname === '/',                 enabled: true },
    { href: '/pipeline', label: 'Pipeline', active: pathname.startsWith('/pipeline'), enabled: true },
    { href: '/reports',  label: 'Reports',  active: pathname.startsWith('/reports'),  enabled: true },
    { href: '/settings', label: 'Settings', active: pathname.startsWith('/settings'), enabled: true },
  ];

  return (
    <motion.div
      data-testid="motion-sidebar"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={fadeUp.transition}
    >
      <RawSidebar items={items} />
    </motion.div>
  );
}
