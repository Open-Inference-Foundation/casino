import { DOMAIN_TEMPLATES } from '@/lib/domains';

export default function DomainShowcase() {
  return (
    <section className="px-6 py-16 bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[var(--color-text)] mb-3">What you can build</h2>
          <p className="text-[var(--color-text-secondary)]">
            Pre-configured domains with the right agents and data model. Or describe anything.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {DOMAIN_TEMPLATES.map((domain) => (
            <div
              key={domain.id}
              className="flex flex-col gap-2 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:shadow-sm transition-all"
            >
              <span className="text-2xl">{domain.icon}</span>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">{domain.name}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                  {domain.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
