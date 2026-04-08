'use client';

import { DOMAIN_TEMPLATES } from '@/lib/domains';

interface DomainPickerProps {
  onSelect: (prompt: string) => void;
}

export default function DomainPicker({ onSelect }: DomainPickerProps) {
  return (
    <div className="flex flex-col gap-4 p-6 overflow-y-auto panel-scroll flex-1">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">What do you want to build?</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Pick a template to get started, or describe anything below.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {DOMAIN_TEMPLATES.map((domain) => (
          <button
            key={domain.id}
            onClick={() => onSelect(domain.examplePrompt)}
            className="flex flex-col gap-2 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-left hover:border-[var(--color-border-hover)] hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{domain.icon}</span>
              <span className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                {domain.name}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{domain.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
