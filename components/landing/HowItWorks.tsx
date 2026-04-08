const STEPS = [
  {
    number: '01',
    title: 'Describe',
    description:
      'Tell Casino what you want to build. "A finance tracker where users upload bank statements and the AI categorizes spending." That\'s it.',
    icon: '💬',
  },
  {
    number: '02',
    title: 'Build',
    description:
      'Casino classifies your domain, picks the right agents and database schema, generates a React app, and builds it in a sandbox.',
    icon: '⚡',
  },
  {
    number: '03',
    title: 'Share',
    description:
      'Get a live URL in under 3 minutes. Your app has real user auth, isolated MongoDB per user, and an AI agent that reads and writes data.',
    icon: '🚀',
  },
];

export default function HowItWorks() {
  return (
    <section className="px-6 py-16 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[var(--color-text)] mb-3">How it works</h2>
        <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
          One conversation. A production app.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-8">
        {STEPS.map((step) => (
          <div key={step.number} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{step.icon}</span>
              <span className="text-xs font-mono text-[var(--color-text-tertiary)]">{step.number}</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)]">{step.title}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
