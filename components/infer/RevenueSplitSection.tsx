export default function RevenueSplitSection() {
  const splits = [
    {
      pct: '60%',
      label: 'Builder',
      description: 'The person who built the agent. Every query your agent handles earns you AGENT tokens.',
      color: 'var(--color-accent)',
      bgColor: 'var(--color-accent-light)',
    },
    {
      pct: '30%',
      label: 'Open Inference Foundation',
      description: 'Pays for the AI compute at wholesale rates. Model inference, GPU time, and provider costs.',
      color: 'var(--color-accent-2)',
      bgColor: 'var(--color-accent-2-light)',
    },
    {
      pct: '10%',
      label: 'Flowstack',
      description: 'Infrastructure, hosting, databases, auth, and platform maintenance.',
      color: 'var(--color-text-tertiary)',
      bgColor: 'var(--color-surface-alt)',
    },
  ];

  return (
    <section className="px-6 py-16 sm:py-24 max-w-5xl mx-auto">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-3 text-center">
        Revenue Split
      </h2>
      <p className="text-[var(--color-text-secondary)] text-center mb-10 max-w-xl mx-auto">
        Every query splits 60 / 30 / 10. Transparent and verifiable on-chain.
      </p>

      {/* Stacked bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex rounded-lg overflow-hidden h-12 border border-[var(--color-border)]">
          <div
            className="flex items-center justify-center text-xs font-bold text-white"
            style={{
              width: '60%',
              backgroundColor: 'var(--color-accent)',
            }}
          >
            60%
          </div>
          <div
            className="flex items-center justify-center text-xs font-bold text-white"
            style={{
              width: '30%',
              backgroundColor: 'var(--color-accent-2)',
            }}
          >
            30%
          </div>
          <div
            className="flex items-center justify-center text-xs font-bold text-[var(--color-text-secondary)]"
            style={{
              width: '10%',
              backgroundColor: 'var(--color-surface-alt)',
            }}
          >
            10%
          </div>
        </div>
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {splits.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-2xl font-bold font-mono"
                style={{ color: s.color }}
              >
                {s.pct}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-tertiary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {s.label}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {s.description}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--color-text-tertiary)] text-center mt-6 italic">
        Earnings are in AGENT. Verifiable on-chain.
      </p>
    </section>
  );
}
