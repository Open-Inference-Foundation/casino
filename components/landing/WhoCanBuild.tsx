const SIGNALS = [
  'Build something silly just because',
  'Make a tool for yourself that nobody else will ever use',
  'Automate the boring parts of your work',
  'Ship a real product without hiring engineers',
  'Build for your team, your family, or just you',
  'Come with an idea, leave with a working app',
];

export default function WhoCanBuild() {
  return (
    <section className="w-full max-w-2xl mx-auto" aria-label="Who can build">
      <p className="text-sm text-[var(--color-text-secondary)] text-center mb-5">
        No code. No AI background. No specific reason required.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
        {SIGNALS.map((signal) => (
          <div key={signal} className="flex items-start gap-2.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="mt-0.5 flex-shrink-0"
            >
              <path
                d="M2 7l3.5 3.5L12 4"
                stroke="var(--color-accent)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm text-[var(--color-text)]">{signal}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
