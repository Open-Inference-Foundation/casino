'use client';

import { useState } from 'react';
import type { SiteVersion } from '@flowstack/sdk';

interface VersionHistoryProps {
  versions: SiteVersion[];
  liveVersion: number | null;
  isLoading: boolean;
  onPromote: (version: number) => Promise<boolean>;
  onDelete: (version: number) => Promise<boolean>;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function VersionHistory({
  versions,
  liveVersion,
  isLoading,
  onPromote,
  onDelete,
  onClose,
}: VersionHistoryProps) {
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const sorted = [...versions].sort((a, b) => b.version - a.version);

  const handlePromote = async (version: number) => {
    setPendingAction(`promote-${version}`);
    await onPromote(version);
    setPendingAction(null);
  };

  const handleDelete = async (version: number) => {
    setPendingAction(`delete-${version}`);
    await onDelete(version);
    setPendingAction(null);
    setConfirmDelete(null);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] border-l border-[var(--color-border)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0">
        <span className="text-xs font-semibold text-[var(--color-text)]">Version History</span>
        <button
          onClick={onClose}
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
          title="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Version list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {isLoading && sorted.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="w-4 h-4 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] spin" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-xs text-[var(--color-text-tertiary)] text-center py-8">No versions yet</p>
        ) : (
          <div className="space-y-1">
            {sorted.map((v) => {
              const isLive = v.version === liveVersion;
              const isDeleting = pendingAction === `delete-${v.version}`;
              const isPromoting = pendingAction === `promote-${v.version}`;

              return (
                <div
                  key={v.version}
                  className={`group relative rounded-lg border px-3 py-2.5 transition-colors ${
                    isLive
                      ? 'border-[var(--color-success)]/30 bg-[var(--color-success-light)]'
                      : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/40'
                  }`}
                >
                  {/* Top row: version badge + timestamp */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[var(--color-text)]">
                        v{v.version}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-alt)] text-[var(--color-text-tertiary)]">
                        {v.type}
                      </span>
                      {isLive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-success)] text-white font-medium">
                          LIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--color-text-tertiary)]">
                      {v.createdAt ? timeAgo(v.createdAt) : ''}
                    </span>
                  </div>

                  {/* Description */}
                  {v.description && (
                    <p className="text-xs text-[var(--color-text-secondary)] mb-2 line-clamp-2">
                      {v.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {v.url && (
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[var(--color-accent)] hover:underline"
                      >
                        Open
                      </a>
                    )}
                    {!isLive && (
                      <>
                        <button
                          onClick={() => handlePromote(v.version)}
                          disabled={!!pendingAction}
                          className="text-[10px] text-[var(--color-accent)] hover:underline disabled:opacity-50"
                        >
                          {isPromoting ? 'Promoting...' : 'Promote'}
                        </button>
                        {confirmDelete === v.version ? (
                          <span className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(v.version)}
                              disabled={!!pendingAction}
                              className="text-[10px] text-[var(--color-error)] hover:underline disabled:opacity-50"
                            >
                              {isDeleting ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-[10px] text-[var(--color-text-tertiary)] hover:underline"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(v.version)}
                            disabled={!!pendingAction}
                            className="text-[10px] text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] hover:underline disabled:opacity-50"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
