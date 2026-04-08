export default function LifecycleSection() {
  const steps = [
    {
      num: '1',
      title: 'Buy INFER',
      description:
        'Acquire INFER on Uniswap (Arbitrum One). This is your membership token — fixed supply, no inflation.',
    },
    {
      num: '2',
      title: 'Stake INFER',
      description:
        'Lock INFER in the staking contract. Higher tiers unlock deeper discounts on AGENT credits.',
      table: [
        { tier: 'Member', amount: '1,000', discount: '15%' },
        { tier: 'Pro', amount: '10,000', discount: '30%' },
        { tier: 'Founder', amount: '100,000', discount: '50%' },
      ],
    },
    {
      num: '3',
      title: 'Get AGENT',
      description:
        'Purchase AGENT credits at your discounted rate. AGENT is the compute currency that powers every AI query.',
    },
    {
      num: '4',
      title: 'Use Casino',
      description:
        'Build full-stack apps, run AI agents, query data. Every action spends AGENT credits at co-op rates.',
    },
    {
      num: '5',
      title: 'Build & Earn',
      description:
        'Publish agents and apps. When other users interact with them, you earn 60% of the AGENT spent.',
    },
  ];

  return (
    <section id="lifecycle" className="px-6 py-16 sm:py-24 max-w-5xl mx-auto">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-3 text-center">
        How It Works
      </h2>
      <p className="text-[var(--color-text-secondary)] text-center mb-12 max-w-xl mx-auto">
        Five steps from new member to earning builder.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {steps.map((step) => (
          <div key={step.num} className="relative">
            {/* Step number */}
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-sm font-bold mb-4">
              {step.num}
            </div>

            <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-[0.1em] mb-2">
              {step.title}
            </h3>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">
              {step.description}
            </p>

            {/* Tier table for step 2 */}
            {step.table && (
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] overflow-hidden">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left px-2.5 py-1.5 font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.1em]">
                        Tier
                      </th>
                      <th className="text-right px-2.5 py-1.5 font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.1em]">
                        Stake
                      </th>
                      <th className="text-right px-2.5 py-1.5 font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.1em]">
                        Discount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {step.table.map((row) => (
                      <tr
                        key={row.tier}
                        className="border-b border-[var(--color-border)] last:border-b-0"
                      >
                        <td className="px-2.5 py-1.5 font-medium text-[var(--color-text)]">
                          {row.tier}
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-mono text-[var(--color-accent)]">
                          {row.amount}
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-mono text-[var(--color-accent-2)]">
                          {row.discount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
