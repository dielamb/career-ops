'use client';
import { motion } from 'framer-motion';
import { ProgressMeter as RawProgressMeter, type ProgressMeterProps } from './raw/ProgressMeter';
import { fadeUp } from '@/lib/motion-presets';

export function ProgressMeter(props: ProgressMeterProps) {
  return (
    <motion.div
      data-testid="motion-progress-meter"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={fadeUp.transition}
    >
      <RawProgressMeter {...props} />
    </motion.div>
  );
}
