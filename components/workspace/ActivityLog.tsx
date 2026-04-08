'use client';

import { useState } from 'react';
import { type ActivityEvent } from '../../lib/hooks/useQueryTimer';

interface ActivityLogProps {
  events: ActivityEvent[];
  isRunning: boolean;
}

function formatElapsedMs(ms: number): string {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `0:${String(secs).padStart(2, '0')}`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ActivityLog({ events, isRunning }: ActivityLogProps) {
  const [expanded, setExpanded] = useState(false);

  // Don't render if only start event
  if (events.length <= 1) return null;

  return (
    <div className="mt-1">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-[10px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
      >
        <span className={`transition-transform ${expanded ? 'rotate-90' : ''}`}>
          &#9654;
        </span>
        <span>Activity log ({events.length})</span>
      </button>

      {expanded && (
        <div className="mt-1 ml-1 border-l border-[var(--color-border)] pl-2 space-y-0.5 max-h-40 overflow-y-auto">
          {events.map((evt, i) => {
            const isCurrent = isRunning && i === events.length - 1;
            return (
              <div
                key={i}
                className={`flex items-start gap-2 text-[10px] ${
                  isCurrent
                    ? 'text-[var(--color-text-secondary)] font-medium'
                    : 'text-[var(--color-text-tertiary)]'
                }`}
              >
                <span className="font-mono flex-shrink-0 w-8 text-right tabular-nums">
                  {formatElapsedMs(evt.elapsedMs)}
                </span>
                <span className="truncate">
                  {isCurrent && (
                    <span className="inline-block w-2 h-2 mr-1 rounded-full border border-current border-t-transparent animate-spin align-text-bottom" />
                  )}
                  {evt.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
