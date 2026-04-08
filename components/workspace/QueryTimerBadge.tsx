'use client';

import { type QueryTimerState } from '../../lib/hooks/useQueryTimer';

interface QueryTimerBadgeProps {
  timer: QueryTimerState;
  onCancel?: () => void;
}

const COLOR_MAP = {
  green: 'text-[var(--color-success)]',
  amber: 'text-[var(--color-warning)]',
  red: 'text-[var(--color-error)]',
} as const;

const BG_MAP = {
  green: 'bg-[var(--color-success-light)]',
  amber: 'bg-[var(--color-warning-light)]',
  red: 'bg-[var(--color-error-light)]',
} as const;

export default function QueryTimerBadge({ timer, onCancel }: QueryTimerBadgeProps) {
  // Don't render for very fast queries (< 3s and already complete)
  if (timer.state === 'complete' && timer.elapsed < 3) return null;
  if (timer.state === 'idle') return null;

  const isRunning = timer.state === 'running';
  const colorClass = COLOR_MAP[timer.color];
  const bgClass = BG_MAP[timer.color];

  return (
    <div className={`flex flex-col gap-0.5 mt-2 px-2.5 py-1.5 rounded-lg ${bgClass}`}>
      {/* Timer line */}
      <div className="flex items-center gap-2">
        <span className={`text-xs font-mono font-semibold ${colorClass}`}>
          {isRunning && (
            <span className="inline-block w-2.5 h-2.5 mr-1 rounded-full border-[1.5px] border-current border-t-transparent animate-spin align-text-bottom" />
          )}
          {timer.elapsedDisplay}
        </span>
        <span className="text-[10px] text-[var(--color-text-tertiary)]">
          {timer.typicalLabel}
        </span>
      </div>

      {/* Activity line */}
      {isRunning && timer.currentActivity && (
        <span className="text-[11px] text-[var(--color-text-secondary)] truncate">
          {timer.currentActivity}
        </span>
      )}

      {/* Complete state — brief done message */}
      {timer.state === 'complete' && timer.elapsed >= 3 && (
        <span className="text-[10px] text-[var(--color-text-tertiary)]">
          Done in {timer.elapsedDisplay}
        </span>
      )}

      {/* Cancelled state */}
      {timer.state === 'cancelled' && (
        <span className="text-[10px] text-[var(--color-error)]">
          Cancelled at {timer.elapsedDisplay}
        </span>
      )}

      {/* Cancel button — appears in red state */}
      {isRunning && timer.color === 'red' && onCancel && (
        <div className="flex items-center gap-2 mt-1">
          {timer.isStuck ? (
            <span className="text-[10px] text-[var(--color-error)] font-medium">
              No activity for 30s — may be stuck
            </span>
          ) : (
            <span className="text-[10px] text-[var(--color-text-tertiary)]">
              Taking longer than usual
            </span>
          )}
          <button
            onClick={onCancel}
            className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-error)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
