import Link from 'next/link';

export default function Hero() {
  return (
    <section className="px-6 pt-20 pb-16 text-center max-w-4xl mx-auto">
      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] text-xs font-medium mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
        AI-powered app builder
      </div>

      <h1 className="text-5xl sm:text-6xl font-bold text-[var(--color-text)] leading-tight tracking-tight mb-6">
        Describe an app.
        <br />
        <span className="text-[var(--color-accent)]">Get a live URL.</span>
      </h1>

      <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10">
        Ca<span className="text-[var(--color-accent)] font-medium">$</span>ino builds full-stack apps
        with AI agent backends, user auth, and persistent data — from a single conversation.
        No code required.
      </p>

      <div className="flex items-center justify-center gap-4">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-accent)] text-white font-semibold text-sm hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm"
        >
          Start building free
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[var(--color-text-secondary)] font-medium text-sm hover:text-[var(--color-text)] transition-colors"
        >
          Sign in
        </Link>
      </div>

      {/* Social proof */}
      <p className="mt-8 text-xs text-[var(--color-text-tertiary)]">
        No credit card required · Deploy in under 3 minutes
      </p>
    </section>
  );
}
