import { CATEGORIES, type CapabilityCategory } from '@/lib/capability-examples';

interface CategoryGridProps {
  selected: CapabilityCategory | 'all';
  onSelect: (category: CapabilityCategory | 'all') => void;
}

export default function CategoryGrid({ selected, onSelect }: CategoryGridProps) {
  return (
    <section className="w-full max-w-3xl mx-auto" aria-label="What you can build">
      <div className="text-center mb-6">
        <p className="text-sm text-[var(--color-text-secondary)]">
          <span className="text-[var(--color-text)] font-medium">Not just chatbots.</span>
          {' '}
          <span className="text-[var(--color-text)] font-medium">Not just dashboards.</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id === selected ? 'all' : cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              cat.id === selected
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
        Build whatever you need.
      </p>
    </section>
  );
}
