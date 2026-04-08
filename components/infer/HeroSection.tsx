'use client';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:py-40">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full opacity-8 blur-[140px]"
        style={{
          background:
            'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full opacity-6 blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, var(--color-accent-2) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            Open Inference Foundation
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-[family-name:var(--font-syne)] text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-[var(--color-text)] mb-6">
          The Inference{' '}
          <span className="text-[var(--color-accent)]">Co-op</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-[var(--color-text-secondary)] leading-relaxed max-w-2xl mx-auto mb-10">
          Buy INFER. Stake it. Get cheaper AI. Build agents. Get paid when people
          use them. One token for membership. One token for compute. The more
          people join, the cheaper it gets for everyone.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#lifecycle"
            className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] px-8 py-3.5 rounded-lg font-semibold text-sm transition-colors w-full sm:w-auto text-center"
          >
            Stake INFER
          </a>
          <a
            href="/register"
            className="border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-border-hover)] px-8 py-3.5 rounded-lg font-semibold text-sm transition-colors w-full sm:w-auto text-center"
          >
            Try the Demo
          </a>
        </div>
      </div>
    </section>
  );
}
