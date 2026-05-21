'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, pixelBootUp } from '@/lib/motion-presets';
import { useToast } from '@/components/Toast';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const { showToast } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const motion1 = shouldReduceMotion ? {} : pixelBootUp;
  const motionFade = shouldReduceMotion ? {} : fadeUp;

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      console.log('[auth] sign in stub:', { email });
      showToast('Auth not yet configured — Supabase coming soon', 'info');
    } finally {
      setPending(false);
    }
  }

  async function handleGoogleOAuth() {
    showToast('Google OAuth coming soon', 'info');
  }

  return (
    <div className="relative min-h-screen bg-bg overflow-hidden">

      {/* pixel grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(10,10,8,0.015) 3px, rgba(10,10,8,0.015) 4px)',
        }}
      />
      {/* CRT scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 3px, rgba(0,212,255,0.015) 3px, rgba(0,212,255,0.015) 4px)',
        }}
      />

      {/* Two-column grid layout */}
      <div className="relative z-10 grid min-h-screen md:grid-cols-[60fr_40fr] grid-cols-1">

        {/* LEFT: Brand panel */}
        <section
          className="relative flex flex-col justify-center px-6 md:px-[52px] py-12 bg-bg overflow-hidden border-r-0 md:border-r-[2.5px] md:border-ink"
          aria-label="career-ops branding"
        >
          {/* SVG geometry layer — viewBox 600x900 matches brand area proportions */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 600 900"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shape 1: TOP-LEFT magenta bar */}
            <rect x="36" y="110" width="130" height="9" fill="var(--color-magenta)" />
            {/* Shape 2: TOP-RIGHT large cyan circle */}
            <circle cx="510" cy="130" r="82" fill="none" stroke="var(--color-cyber)" strokeWidth="4" />
            {/* Shape 3: CENTER-RIGHT small ink dot */}
            <circle cx="530" cy="480" r="9" fill="var(--color-ink)" />
            {/* Shape 4: BOTTOM-LEFT large ink diamond */}
            <rect
              x="-54"
              y="-54"
              width="108"
              height="108"
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="3.5"
              transform="translate(86,792) rotate(45)"
            />
            {/* Shape 5: BOTTOM-RIGHT magenta dot */}
            <circle cx="488" cy="780" r="13" fill="var(--color-magenta)" stroke="var(--color-ink)" strokeWidth="2" />
          </svg>

          {/* Brand content above SVG */}
          <div className="relative z-10">
            {/* Wordmark */}
            <h1
              className="font-display font-black text-ink leading-none tracking-[-2px] text-[72px] mb-6"
              style={{ fontVariationSettings: '"wdth" 60' }}
            >
              career-ops.
            </h1>

            {/* 3 USPs */}
            <div className="flex flex-col gap-[6px] mb-10" aria-label="product USPs">
              <p className="font-mono text-xs text-ink-muted leading-relaxed tracking-[0.02em]">
                {'// score fit before applying'}&nbsp;
                <span className="bg-acid text-ink font-bold text-[13px] px-[7px] py-[2px] tracking-[0.04em]">✓</span>
              </p>
              <p className="font-mono text-xs text-ink-muted leading-relaxed tracking-[0.02em]">
                {'// CV auto-tailored per role'}&nbsp;
                <span className="bg-acid text-ink font-bold text-[13px] px-[7px] py-[2px] tracking-[0.04em]">✓</span>
              </p>
              <p className="font-mono text-xs text-ink-muted leading-relaxed tracking-[0.02em]">
                {'// you submit. we never do.'}&nbsp;
                <span className="bg-acid text-ink font-bold text-[13px] px-[7px] py-[2px] tracking-[0.04em]">✓</span>
              </p>
            </div>

            {/* EVALUATE · APPLY · HIRED tags */}
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 mt-9" aria-label="pipeline steps">
              <span
                className="font-display font-black text-ink inline-block px-[10px] py-[3px] text-[28px] md:text-[36px] leading-none tracking-[-0.5px] shadow-[2px_2px_0_var(--color-ink)] md:shadow-[3px_3px_0_var(--color-ink)] bg-cyber"
                style={{ fontVariationSettings: '"wdth" 60' }}
              >
                EVALUATE
              </span>
              <span className="hidden md:inline font-mono text-base text-ink-muted" aria-hidden="true">·</span>
              <span
                className="font-display font-black text-ink inline-block px-[10px] py-[3px] text-[28px] md:text-[36px] leading-none tracking-[-0.5px] shadow-[2px_2px_0_var(--color-ink)] md:shadow-[3px_3px_0_var(--color-ink)] bg-acid"
                style={{ fontVariationSettings: '"wdth" 60' }}
              >
                APPLY
              </span>
              <span className="hidden md:inline font-mono text-base text-ink-muted" aria-hidden="true">·</span>
              <span
                className="font-display font-black text-ink inline-block px-[10px] py-[3px] text-[28px] md:text-[36px] leading-none tracking-[-0.5px] shadow-[2px_2px_0_var(--color-ink)] md:shadow-[3px_3px_0_var(--color-ink)] bg-magenta"
                style={{ fontVariationSettings: '"wdth" 60' }}
              >
                HIRED
              </span>
            </div>
          </div>
        </section>

        {/* RIGHT: Form panel */}
        <section
          className="flex items-center justify-center px-10 py-12 bg-bg"
          aria-label="sign in"
        >
          <motion.div
            {...motion1}
            className="w-full max-w-[340px] bg-paper border-[2.5px] border-ink shadow-[6px_6px_0_var(--color-ink)] rounded-none p-[28px]"
          >
            {/* Header bar — ink-inverted, bleeds to card edges */}
            <p className="font-mono text-[13px] font-bold tracking-[0.1em] uppercase bg-ink text-bg px-[12px] py-[7px] -mx-[28px] -mt-[28px] mb-6">
              {'// sign in'}
            </p>

            <form onSubmit={handleSignIn} noValidate>

              {/* Email field */}
              <motion.div
                {...motionFade}
                transition={{ ...fadeUp.transition, delay: 0.05 }}
                className="mb-[18px]"
              >
                <label
                  htmlFor="email"
                  className="block font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-ink-muted mb-[6px]"
                >
                  email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-[12px] py-[10px] bg-bg border-[2px] border-ink rounded-none font-mono text-[13px] text-ink placeholder:text-ink-dim outline-none focus:border-cyber focus-visible:ring-2 focus-visible:ring-cyber focus-visible:ring-offset-1 focus-visible:outline-none"
                />
              </motion.div>

              {/* Password field */}
              <motion.div
                {...motionFade}
                transition={{ ...fadeUp.transition, delay: 0.1 }}
                className="mb-[18px]"
              >
                <label
                  htmlFor="password"
                  className="block font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-ink-muted mb-[6px]"
                >
                  password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-[12px] py-[10px] bg-bg border-[2px] border-ink rounded-none font-mono text-[13px] text-ink placeholder:text-ink-dim outline-none focus:border-cyber focus-visible:ring-2 focus-visible:ring-cyber focus-visible:ring-offset-1 focus-visible:outline-none"
                />
              </motion.div>

              {/* Submit button */}
              <motion.button
                {...motionFade}
                transition={{ ...fadeUp.transition, delay: 0.15 }}
                type="submit"
                disabled={pending}
                className="block w-full mt-[8px] px-[20px] py-[12px] bg-ink text-bg border-[2px] border-ink rounded-none font-mono text-sm font-semibold tracking-[0.04em] uppercase cursor-pointer text-center shadow-[3px_3px_0_var(--color-cyber)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[3px_3px_0_var(--color-cyber)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber focus-visible:ring-offset-2"
              >
                {pending ? '[Signing in…]' : 'CONTINUE →'}
              </motion.button>

              {/* OR divider */}
              <div className="flex items-center gap-[10px] my-[18px]" aria-hidden="true">
                <div className="flex-1 h-[1.5px] bg-chrome" />
                <span className="font-mono text-[10px] text-ink-dim tracking-[0.1em] whitespace-nowrap">{'// OR'}</span>
                <div className="flex-1 h-[1.5px] bg-chrome" />
              </div>

              {/* Google OAuth button */}
              <motion.button
                {...motionFade}
                transition={{ ...fadeUp.transition, delay: 0.2 }}
                type="button"
                onClick={handleGoogleOAuth}
                className="flex items-center justify-center gap-[8px] w-full px-[20px] py-[10px] bg-paper border-[2px] border-ink rounded-none font-body text-[13px] font-medium text-ink cursor-pointer hover:bg-chrome hover:shadow-[3px_3px_0_var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber focus-visible:ring-offset-2"
              >
                {/* Inline Google G SVG — no external icon dependency */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="flex-shrink-0"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                CONTINUE WITH GOOGLE
              </motion.button>

            </form>

            {/* Toggle sign up link */}
            <p className="mt-[18px] font-mono text-[10px] text-ink-dim text-center tracking-[0.04em]">
              No account?{' '}
              <a
                href="/signup"
                className="text-ink font-bold border-b-[2px] border-ink no-underline hover:bg-cyber hover:border-cyber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber focus-visible:ring-offset-1"
              >
                {'// SIGN UP'}
              </a>
            </p>

          </motion.div>
        </section>

      </div>
    </div>
  );
}
