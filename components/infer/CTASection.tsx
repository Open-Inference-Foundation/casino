export default function CTASection() {
  return (
    <section className="px-6 py-20 sm:py-28 bg-[var(--color-surface-alt)]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-[family-name:var(--font-syne)] text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-4">
          Ready to join?
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-10 max-w-md mx-auto">
          Stake for cheaper AI. Build agents that earn. Be part of the co-op
          from day one.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://app.uniswap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] px-8 py-3.5 rounded-lg font-semibold text-sm transition-colors w-full sm:w-auto text-center"
          >
            Buy INFER on Uniswap
          </a>
          <a
            href="/register"
            className="border border-[var(--color-accent-2)] text-[var(--color-accent-2)] hover:bg-[var(--color-accent-2-light)] px-8 py-3.5 rounded-lg font-semibold text-sm transition-colors w-full sm:w-auto text-center"
          >
            Try Casino Free
          </a>
          <a
            href="https://docs.flowstack.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-border-hover)] px-8 py-3.5 rounded-lg font-semibold text-sm transition-colors w-full sm:w-auto text-center"
          >
            Build an Agent — SDK Docs
          </a>
        </div>
      </div>
    </section>
  );
}
