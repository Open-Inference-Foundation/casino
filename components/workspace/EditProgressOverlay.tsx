'use client';

import { useState } from 'react';
import { BuildStage } from '@/lib/build-stages';
import PipelineStage from './PipelineStage';

interface EditProgressOverlayProps {
  stages: BuildStage[];
}

export default function EditProgressOverlay({ stages }: EditProgressOverlayProps) {
  const [collapsed, setCollapsed] = useState(false);
  const activeStage = stages.find((s) => s.status === 'active' || s.status === 'retrying');

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] transition-colors z-10"
      >
        <span className="w-3 h-3 rounded-full border-2 border-[var(--color-accent)] border-t-transparent spin" />
        {activeStage?.label ?? 'Editing'}...
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 w-64 rounded-xl bg-[var(--color-surface)]/95 backdrop-blur-sm border border-[var(--color-border)] shadow-lg z-10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-[var(--color-accent)] border-t-transparent spin" />
          <span className="text-xs font-semibold text-[var(--color-text)]">Editing your app</span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
          title="Minimize"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Stages */}
      <div className="px-4 pt-3 pb-1">
        {stages.map((stage, i) => (
          <PipelineStage key={stage.id} stage={stage} isLast={i === stages.length - 1} />
        ))}
      </div>
    </div>
  );
}
