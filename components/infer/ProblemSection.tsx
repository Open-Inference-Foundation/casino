export default function ProblemSection() {
  return (
    <section className="px-6 py-16 sm:py-24 max-w-3xl mx-auto">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-8">
        The Problem
      </h2>

      <div className="space-y-5 text-base sm:text-lg leading-relaxed text-[var(--color-text-secondary)]">
        <p>
          You pay retail for AI inference. So does everyone else. Every query,
          full price, no negotiation.
        </p>
        <p>
          Enterprises pay{' '}
          <span className="text-[var(--color-accent)] font-semibold">
            50-60% less
          </span>{' '}
          because they negotiate volume discounts directly with providers.
        </p>
        <p className="text-[var(--color-text)] font-medium">
          You can&apos;t negotiate alone. But you can negotiate together.
        </p>
      </div>
    </section>
  );
}
