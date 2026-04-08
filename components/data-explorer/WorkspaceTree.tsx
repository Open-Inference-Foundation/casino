'use client';

import { useState } from 'react';
import type { UserDataOverview } from '@flowstack/sdk';

interface WorkspaceTreeProps {
  overview: UserDataOverview | null;
}

export default function WorkspaceTree({ overview }: WorkspaceTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (!overview?.workspaces.length) {
    return (
      <div className="p-5 text-xs text-[var(--color-text-tertiary)] text-center">
        No workspaces found. Create one from the workspace view.
      </div>
    );
  }

  const toggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="p-3 space-y-1">
      {overview.workspaces.map(ws => {
        const isExpanded = expandedIds.has(ws.workspace_id);
        const counts = ws.artifact_counts || {};
        const total = Object.values(counts).reduce((s, n) => s + (n || 0), 0);

        return (
          <div key={ws.workspace_id}>
            <button
              onClick={() => toggle(ws.workspace_id)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-[var(--color-surface-alt)] transition-colors"
            >
              <svg
                width="10" height="10" viewBox="0 0 10 10"
                className={`transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
              >
                <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[var(--color-text)] truncate">
                  {ws.name || ws.workspace_id}
                </p>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">
                  {total} artifact{total !== 1 ? 's' : ''}
                </p>
              </div>
            </button>

            {isExpanded && (
              <div className="ml-5 pl-3 border-l border-[var(--color-border)]/50 space-y-0.5 pb-1">
                {Object.entries(counts).filter(([, n]) => n > 0).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between px-2 py-1 rounded text-[11px]"
                  >
                    <span className="text-[var(--color-text-secondary)] capitalize">{type}</span>
                    <span className="text-[var(--color-text-tertiary)] font-mono">{count}</span>
                  </div>
                ))}
                {total === 0 && (
                  <p className="px-2 py-1 text-[10px] text-[var(--color-text-tertiary)]">Empty workspace</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
