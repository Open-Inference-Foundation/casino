'use client';

import { useState } from 'react';
import type { SiteVersion } from '@flowstack/sdk';

interface MobileSettingsSheetProps {
  versions: SiteVersion[];
  liveVersion: number | null;
  isLoading: boolean;
  onPromote: (version: number) => Promise<boolean>;
  onDelete: (version: number) => Promise<boolean>;
  onClose: () => void;
  appName?: string | null;
  isPreviewDraft?: boolean;
  draftVersion?: number | null;
  onPromoteDraft?: () => void;
  onDiscardDraft?: () => void;
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

export default function MobileSettingsSheet({
  versions,
  liveVersion,
  isLoading,
  onPromote,
  onDelete,
  onClose,
  appName,
  isPreviewDraft,
  draftVersion,
  onPromoteDraft,
  onDiscardDraft,
}: MobileSettingsSheetProps) {
  const [promoting, setPromoting] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handlePromote = async (version: number) => {
    setPromoting(version);
    await onPromote(version);
    setPromoting(null);
  };

  const handleDelete = async (version: number) => {
    setDeleting(version);
    await onDelete(version);
    setDeleting(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-h-[85vh] rounded-t-2xl bg-[var(--color-surface)] border-t border-[var(--color-border)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 border-b border-[var(--color-border)]">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            {appName || 'App Settings'}
          </h3>
        </div>

        {/* Draft actions */}
        {isPreviewDraft && draftVersion && (
          <div className="px-4 py-3 border-b border-[var(--color-border)] bg-amber-500/5">
            <p className="text-xs text-amber-600 mb-2">
              Draft v{draftVersion} — not yet live
            </p>
            <div className="flex gap-2">
              {onDiscardDraft && (
                <button
                  onClick={onDiscardDraft}
                  className="flex-1 text-xs py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)]"
                >
                  Discard
                </button>
              )}
              {onPromoteDraft && (
                <button
                  onClick={onPromoteDraft}
                  className="flex-1 text-xs py-2 rounded-lg bg-emerald-600 text-white"
                >
                  Promote to Live
                </button>
              )}
            </div>
          </div>
        )}

        {/* Versions */}
        <div className="px-4 py-3">
          <h4 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
            Versions
          </h4>
          {isLoading ? (
            <p className="text-xs text-[var(--color-text-tertiary)]">Loading...</p>
          ) : versions.length === 0 ? (
            <p className="text-xs text-[var(--color-text-tertiary)]">No versions yet</p>
          ) : (
            <div className="space-y-2">
              {versions.map((v) => (
                <div
                  key={v.version}
                  className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[var(--color-text)]">
                        v{v.version}
                      </span>
                      {v.version === liveVersion && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-medium">
                          LIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--color-text-tertiary)]">
                      {timeAgo(v.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {v.version !== liveVersion && (
                      <button
                        onClick={() => handlePromote(v.version)}
                        disabled={promoting === v.version}
                        className="text-[10px] px-2 py-1 rounded bg-emerald-600 text-white disabled:opacity-50"
                      >
                        {promoting === v.version ? '...' : 'Promote'}
                      </button>
                    )}
                    {v.version !== liveVersion && (
                      <button
                        onClick={() => handleDelete(v.version)}
                        disabled={deleting === v.version}
                        className="text-[10px] px-2 py-1 rounded text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deleting === v.version ? '...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
