import { BuildStage } from '@/lib/build-stages';
import BuildProgress from './BuildProgress';
import AppPreview from './AppPreview';
import EditProgressOverlay from './EditProgressOverlay';
import EmptyState from './EmptyState';

interface PreviewPanelProps {
  state: 'empty' | 'building' | 'editing' | 'preview';
  buildStages?: BuildStage[];
  previewUrl?: string | null;
  appName?: string | null;
  refreshKey?: number;
  isPreviewDraft?: boolean;
  draftVersion?: number | null;
  onPromote?: () => void;
  onDiscard?: () => void;
}

export default function PreviewPanel({
  state,
  buildStages,
  previewUrl,
  appName,
  refreshKey,
  isPreviewDraft,
  draftVersion,
  onPromote,
  onDiscard,
}: PreviewPanelProps) {
  const borderClass = 'border-l border-[var(--color-border)]';

  const baseClass = `h-full min-w-0 ${borderClass}`;
  const flexStyle = { flex: '1 1 0%' };

  if (state === 'building') {
    return (
      <div className={baseClass} style={flexStyle}>
        <BuildProgress stages={buildStages ?? []} />
      </div>
    );
  }

  if (state === 'editing' && previewUrl) {
    return (
      <div className={`${baseClass} relative`} style={flexStyle}>
        <AppPreview url={previewUrl} appName={appName} refreshKey={refreshKey} />
        <EditProgressOverlay stages={buildStages ?? []} />
      </div>
    );
  }

  if (state === 'preview' && previewUrl) {
    return (
      <div className={`${baseClass} flex flex-col`} style={flexStyle}>
        {isPreviewDraft && (
          <div className="flex items-center justify-between px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 flex-shrink-0">
            <span className="text-xs font-medium text-amber-600">
              Previewing draft v{draftVersion} — not yet live
            </span>
            <div className="flex items-center gap-2">
              {onDiscard && (
                <button
                  onClick={onDiscard}
                  className="text-xs px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] transition-colors"
                >
                  Discard
                </button>
              )}
              {onPromote && (
                <button
                  onClick={onPromote}
                  className="text-xs px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                >
                  Promote to Live
                </button>
              )}
            </div>
          </div>
        )}
        <div className="flex-1 min-h-0">
          <AppPreview url={previewUrl} appName={appName} refreshKey={refreshKey} />
        </div>
      </div>
    );
  }

  return (
    <div className={baseClass} style={flexStyle}>
      <EmptyState />
    </div>
  );
}
