'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BillingStatus {
  isPro: boolean;
  evalCount: number;
  evalsRemaining: number;
  freeLimit: number;
}

export function UsageMeter() {
  const [status, setStatus] = useState<BillingStatus | null>(null);

  useEffect(() => {
    fetch('/api/billing/status')
      .then((r) => r.json())
      .then((d) => setStatus(d as BillingStatus))
      .catch(() => null);
  }, []);

  if (!status) return null;

  if (status.isPro) {
    return (
      <div className="px-sm py-xs bg-cyber border-[2px] border-ink shadow-[3px_3px_0_var(--color-ink)]">
        <p className="font-mono text-xs text-ink font-semibold uppercase tracking-wider">// Pro Plan</p>
        <p className="font-mono text-xs text-ink">Unlimited evals</p>
      </div>
    );
  }

  const pct = (status.evalCount / status.freeLimit) * 100;
  const warn = status.evalCount >= 8;

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-ink-muted uppercase tracking-wider">
          // {status.evalCount}/{status.freeLimit} evals
        </p>
        {warn && (
          <Link
            href="/billing"
            className="font-mono text-xs text-magenta uppercase tracking-wider hover:underline"
          >
            Upgrade
          </Link>
        )}
      </div>
      <div className="w-full h-[8px] bg-chrome border-[1px] border-ink">
        <div
          className={`h-full ${warn ? 'bg-magenta' : 'bg-cyber'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
