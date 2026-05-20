/**
 * Framer Motion v12 variant presets for career-ops dashboard.
 * Encodes DESIGN.md motion tokens (easing, durations, signature moments).
 * Consumed by motion-wrapped components in dashboard/web/components/.
 *
 * Easing curve [0.22, 1, 0.36, 1] = cubic-bezier(0.22, 1, 0.36, 1) (out-expo, fast start)
 * per DESIGN.md > Motion.
 */

/** Fade + lift entrance. motion-medium = 300ms. Used by StatusBadge, ProgressMeter. */
export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
} as const;

/** Score number count-up 0 → N over 800ms (motion-long). Returns variant tween; consumer
 *  reads `count` via useMotionValue / useTransform when animating numeric text. */
export const scoreCountUp = (from: number, to: number) => ({
  initial: { count: from },
  animate: { count: to },
  transition: { duration: 0.8, ease: 'easeOut' as const },
});

/** CRT boot opacity ramp: 0 → 0.5 → 1 over 150ms (3 frames @ 50ms). Used by `/today` hero. */
export const pixelBootUp = {
  initial: { opacity: 0 },
  animate: { opacity: [0, 0.5, 1] },
  transition: { duration: 0.15, times: [0, 0.5, 1] },
} as const;

/** Spring config for `layout` prop reorder animations (filter chips on /pipeline). */
export const layoutSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
} as const;

/** RGB-split text shadow flash (#ff006e / #00d4ff) at score reveal peak, 80ms. */
export const chromaticFlash = {
  initial: { textShadow: '0 0 0 transparent' },
  animate: { textShadow: ['2px 0 0 #ff006e, -2px 0 0 #00d4ff', '0 0 0 transparent'] },
  transition: { duration: 0.08, times: [0, 1] },
} as const;
