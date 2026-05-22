import { createServerSupabase } from '@/lib/supabase-server';
import { BillingActions } from '@/components/BillingActions';

export const dynamic = 'force-dynamic';

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  let isPro = false;
  let proUntil: string | null = null;
  let evalCount = 0;
  let hasStripeCustomer = false;

  if (user) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

    const [{ data: profile }, { data: usage }] = await Promise.all([
      supabase.from('profiles').select('is_pro, pro_until, stripe_customer_id').eq('user_id', user.id).single(),
      supabase.from('usage_counters').select('eval_count, month_start').eq('user_id', user.id).single(),
    ]);

    isPro = profile?.is_pro ?? false;
    proUntil = profile?.pro_until ?? null;
    hasStripeCustomer = !!profile?.stripe_customer_id;
    evalCount = usage?.month_start === monthStart ? (usage.eval_count ?? 0) : 0;
  }

  return (
    <div className="flex flex-col gap-2xl max-w-[520px]">
      <header>
        <h1
          className="font-display font-extrabold text-5xl text-ink"
          style={{ fontVariationSettings: '"wdth" 60' }}
        >
          Billing.
        </h1>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-muted mt-2">
          // plan · usage · subscription
        </p>
      </header>

      {params.success && (
        <div className="bg-cyber text-ink border-[2.5px] border-ink shadow-[4px_4px_0_var(--color-ink)] px-md py-sm font-mono text-sm font-semibold uppercase tracking-wider">
          ✓ Upgrade successful — Pro plan active!
        </div>
      )}
      {params.canceled && (
        <div className="border-[2.5px] border-ink bg-paper px-md py-sm font-mono text-sm text-ink-muted">
          Checkout canceled — no charge made.
        </div>
      )}

      {/* Current plan */}
      <section className="flex flex-col gap-md">
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink">// Current plan</h2>

        {isPro ? (
          <div className="bg-cyber border-[2.5px] border-ink shadow-[6px_6px_0_var(--color-ink)] px-md py-md flex flex-col gap-sm">
            <div className="flex items-center gap-sm">
              <span className="bg-ink text-cyber font-mono font-bold text-xs uppercase tracking-widest px-sm py-[2px]">PRO</span>
              <span className="font-mono text-xs text-ink font-semibold">$9/month</span>
            </div>
            <p className="font-mono text-sm font-semibold text-ink uppercase tracking-wider">Unlimited evaluations.</p>
            {proUntil && (
              <p className="font-mono text-xs text-ink">
                Renews {new Date(proUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
        ) : (
          <div className="border-[2.5px] border-ink bg-paper px-md py-md flex flex-col gap-xs">
            <div className="flex items-center gap-sm">
              <span className="font-mono text-sm font-semibold text-ink uppercase">Free</span>
              <span className="font-mono text-xs text-ink-muted">$0/month</span>
            </div>
            <p className="font-body text-sm text-ink-muted">
              {evalCount}/5 evaluations used this month.
              {evalCount >= 5 && ' Limit reached — upgrade to keep evaluating.'}
              {evalCount === 4 && ' Running low — 1 evaluation left. Upgrade for 100/mo or BYOK unlimited.'}
            </p>
            <div className="w-full h-[8px] bg-chrome border-[1px] border-ink mt-xs">
              <div
                className={`h-full ${evalCount >= 4 ? 'bg-magenta' : 'bg-cyber'}`}
                style={{ width: `${Math.min(100, (evalCount / 5) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Pro plan card */}
      {!isPro && (
        <section className="flex flex-col gap-md">
          <h2 className="font-mono text-xs uppercase tracking-wider text-ink">// Pro plan — $9/month</h2>
          <div className="border-[2.5px] border-ink shadow-[4px_4px_0_var(--color-ink)] bg-paper px-md py-md flex flex-col gap-sm">
            <ul className="flex flex-col gap-xs font-body text-sm text-ink">
              <li>✓ Unlimited job evaluations</li>
              <li>✓ Claude Opus scoring (most accurate)</li>
              <li>✓ Full pipeline history</li>
              <li>✓ Priority support</li>
            </ul>
          </div>
        </section>
      )}

      <BillingActions isPro={isPro} hasStripeCustomer={hasStripeCustomer} />
    </div>
  );
}
