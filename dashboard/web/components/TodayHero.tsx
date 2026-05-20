'use client';
import { motion } from 'framer-motion';
import { TodayHero as RawTodayHero, type TodayHeroProps } from './raw/TodayHero';
import { pixelBootUp } from '@/lib/motion-presets';

/**
 * Client-side wrapper applying pixelBootUp on mount.
 * pixelBootUp animates the whole hero container in 3 CRT frames (50ms each).
 *
 * Note: spread the readonly arrays from pixelBootUp to satisfy Framer Motion's
 * mutable array type requirement (as const makes them readonly tuples).
 */
export function TodayHero(props: TodayHeroProps) {
  return (
    <motion.div
      data-testid="motion-today-hero"
      initial={pixelBootUp.initial}
      animate={{ opacity: [...pixelBootUp.animate.opacity] }}
      transition={{ duration: pixelBootUp.transition.duration, times: [...pixelBootUp.transition.times] }}
    >
      <RawTodayHero {...props} />
    </motion.div>
  );
}
