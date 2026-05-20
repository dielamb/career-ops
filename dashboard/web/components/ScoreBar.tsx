'use client';
import { motion } from 'framer-motion';
import { ScoreBar as RawScoreBar, type ScoreBarProps } from './raw/ScoreBar';
import { fadeUp } from '@/lib/motion-presets';

export function ScoreBar(props: ScoreBarProps) {
  return (
    <motion.div
      data-testid="motion-score-bar"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      exit={fadeUp.exit}
      transition={fadeUp.transition}
    >
      <RawScoreBar {...props} />
    </motion.div>
  );
}
