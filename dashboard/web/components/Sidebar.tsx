'use client';
import { motion } from 'framer-motion';
import { Sidebar as RawSidebar, type SidebarProps } from './raw/Sidebar';
import { fadeUp } from '@/lib/motion-presets';

export function Sidebar(props: SidebarProps) {
  return (
    <motion.div
      data-testid="motion-sidebar"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={fadeUp.transition}
    >
      <RawSidebar {...props} />
    </motion.div>
  );
}
