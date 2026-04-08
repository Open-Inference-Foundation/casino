export default function TwoTokensSection() {
  return (
    <section className="px-6 py-16 sm:py-24 max-w-5xl mx-auto">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-3 text-center">
        Two Tokens, One System
      </h2>
      <p className="text-[var(--color-text-secondary)] text-center mb-10 max-w-xl mx-auto">
        A membership layer and a compute layer, working together.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* INFER Card */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 border-l-4 border-l-[var(--color-accent)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-light)] flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="6" width="20" height="14" rx="2" />
                <path d="M16 14h.01" />
                <path d="M2 10h20" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-accent)]">
                INFER
              </h3>
              <span className="text-xs font-mono tracking-[0.15em] uppercase text-[var(--color-text-tertiary)]">
                Membership token
              </span>
            </div>
          </div>

          <ul className="space-y-3 text-sm text-[var(--color-text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] mt-0.5 shrink-0">
                &bull;
              </span>
              Stake it. Hold it. Your seat at the co-op.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] mt-0.5 shrink-0">
                &bull;
              </span>
              Fixed supply: 1B tokens. No inflation.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] mt-0.5 shrink-0">
                &bull;
              </span>
              More stakers = stronger collective buying power.
            </li>
          </ul>

          <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-tertiary)] italic">
              Like a Costco card. You buy it once, and everything inside is
              cheaper.
            </p>
          </div>
        </div>

        {/* AGENT Card */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 border-l-4 border-l-[var(--color-accent-2)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-2-light)] flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent-2)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-accent-2)]">
                AGENT
              </h3>
              <span className="text-xs font-mono tracking-[0.15em] uppercase text-[var(--color-text-tertiary)]">
                Compute currency
              </span>
            </div>
          </div>

          <ul className="space-y-3 text-sm text-[var(--color-text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent-2)] mt-0.5 shrink-0">
                &bull;
              </span>
              Spend it on queries, builds, and agent calls.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent-2)] mt-0.5 shrink-0">
                &bull;
              </span>
              Minted on demand. Price pegged to compute cost.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent-2)] mt-0.5 shrink-0">
                &bull;
              </span>
              Earned by builders when their agents get used.
            </li>
          </ul>

          <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-tertiary)] italic">
              Like Costco prices. Cheaper because you&apos;re buying as a group.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
