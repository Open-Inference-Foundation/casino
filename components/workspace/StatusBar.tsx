'use client';

import CopyButton from '@/components/ui/CopyButton';
import { WorkspacePhase } from '@/lib/hooks/useWorkspaceState';

interface StatusBarProps {
  phase: WorkspacePhase;
  currentStage?: string;
  previewUrl?: string | null;
  errorMessage?: string | null;
  isEditing?: boolean;
  currentVersion?: number | null;
  isPreviewDraft?: boolean;
  draftVersion?: number | null;
}

const BUILD_STAGE_LABELS = ['Plan', 'Style', 'Build', 'Publish'];
const EDIT_STAGE_LABELS = ['Read', 'Edit', 'Build', 'Verify', 'Promote'];

export default function StatusBar({ phase, currentStage, previewUrl, errorMessage, isEditing, currentVersion, isPreviewDraft, draftVersion }: StatusBarProps) {
  if (phase === 'idle') {
    return (
      <div className="h-full flex items-center px-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <span className="text-xs text-[var(--color-text-tertiary)]">
          Ca<span className="text-[var(--color-accent)]">$</span>ino Builder
        </span>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="h-full flex items-center px-4 border-t border-[var(--color-border)] bg-[var(--color-error-light)]">
        <span className="text-xs text-[var(--color-error)]">⚠ {errorMessage ?? 'Build failed'}</span>
      </div>
    );
  }

  if (phase === 'complete') {
    if (isPreviewDraft) {
      return (
        <div className="h-full flex items-center justify-between px-4 border-t border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-amber-600">
              Draft v{draftVersion} — preview only
            </span>
            {previewUrl && (
              <span className="text-xs text-[var(--color-text-secondary)] truncate max-w-xs">{previewUrl}</span>
            )}
          </div>
          {previewUrl && <CopyButton text={previewUrl} />}
        </div>
      );
    }
    return (
      <div className="h-full flex items-center justify-between px-4 border-t border-[var(--color-border)] bg-[var(--color-success-light)]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
          <span className="text-xs font-medium text-[var(--color-success)]">
            Published{currentVersion ? ` v${currentVersion}` : ''}
          </span>
          {previewUrl && (
            <span className="text-xs text-[var(--color-text-secondary)] truncate max-w-xs">{previewUrl}</span>
          )}
        </div>
        {previewUrl && <CopyButton text={previewUrl} />}
      </div>
    );
  }

  // building or editing
  const labels = isEditing ? EDIT_STAGE_LABELS : BUILD_STAGE_LABELS;
  const statusText = isEditing ? 'Editing...' : 'Building...';

  return (
    <div className="h-full flex items-center justify-between px-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-3">
        <span className="w-3 h-3 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] spin" />
        <div className="status-stages flex items-center gap-1">
          {labels.map((label, i) => (
            <span key={label} className="flex items-center gap-1">
              <span
                className={`text-xs ${
                  label.toLowerCase() === currentStage?.toLowerCase()
                    ? 'text-[var(--color-accent)] font-semibold'
                    : 'text-[var(--color-text-tertiary)]'
                }`}
              >
                {label}
              </span>
              {i < labels.length - 1 && (
                <span className="text-[var(--color-text-tertiary)] text-xs">→</span>
              )}
            </span>
          ))}
        </div>
      </div>
      <span className="text-xs text-[var(--color-text-tertiary)]">{statusText}</span>
    </div>
  );
}
