'use client';
import { motion } from 'framer-motion';
import { StatusBadge as RawStatusBadge, type StatusBadgeProps } from './raw/StatusBadge';
import { fadeUp } from '@/lib/motion-presets';

export function StatusBadge(props: StatusBadgeProps) {
  return (
    <motion.span
      data-testid="motion-status-badge"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      exit={fadeUp.exit}
      transition={fadeUp.transition}
      className="inline-block"
    >
      <RawStatusBadge {...props} />
    </motion.span>
  );
}
