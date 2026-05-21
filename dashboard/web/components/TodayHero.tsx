'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { TodayHero as RawTodayHero, type TodayHeroProps } from './raw/TodayHero';
import { pixelBootUp } from '@/lib/motion-presets';

/**
 * Client-side wrapper applying pixelBootUp on mount + wiring Top 5 [Open] to /pipeline?id=N.
 */
export function TodayHero(props: TodayHeroProps) {
  const router = useRouter();
  const onOpenTopFive = (id: string) => {
    router.push(`/pipeline?id=${encodeURIComponent(id)}`);
  };

  return (
    <motion.div
      data-testid="motion-today-hero"
      initial={pixelBootUp.initial}
      animate={{ opacity: [...pixelBootUp.animate.opacity] }}
      transition={{ duration: pixelBootUp.transition.duration, times: [...pixelBootUp.transition.times] }}
    >
      <RawTodayHero {...props} onOpenTopFive={onOpenTopFive} />
    </motion.div>
  );
}
