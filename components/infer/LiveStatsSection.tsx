'use client';

export default function LiveStatsSection() {
  const stats = [
    { value: '2.4M', label: 'INFER Staked', color: 'var(--color-accent)' },
    { value: '890K', label: 'AGENT Minted', color: 'var(--color-accent-2)' },
    { value: '1.2M', label: 'Total Queries', color: 'var(--color-accent)' },
    { value: '147', label: 'Registered Agents', color: 'var(--color-accent-2)' },
    { value: '1,247', label: 'Active Stakers', color: 'var(--color-accent)' },
    { value: '32%', label: 'Co-op Discount', color: 'var(--color-accent-2)' },
  ];

  return (
    <section className="px-6 py-16 sm:py-24 bg-[var(--color-surface-alt)]">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-[family-name:var(--font-syne)] text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-3 text-center">
          The Numbers
        </h2>
        <p className="text-[var(--color-text-secondary)] text-center mb-10 max-w-xl mx-auto">
          Real-time network statistics. All verifiable on Arbitrum One.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6 text-center"
            >
              {/* Coming soon badge */}
              <span className="absolute top-2 right-2 text-[9px] font-mono tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-tertiary)] bg-[var(--color-surface-alt)]">
                Preview
              </span>

              <p
                className="text-2xl sm:text-3xl font-bold font-mono"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-[0.1em] mt-1.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
