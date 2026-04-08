'use client';

import CopyButton from '@/components/ui/CopyButton';

interface AppPreviewProps {
  url: string;
  appName?: string | null;
  /** Changing this value forces the iframe to reload (e.g., after an edit rebuild). */
  refreshKey?: number;
}

export default function AppPreview({ url, appName, refreshKey }: AppPreviewProps) {
  // Cache-bust: append a timestamp param so the iframe reloads even for the same URL
  const iframeSrc = refreshKey ? `${url}${url.includes('?') ? '&' : '?'}_r=${refreshKey}` : url;

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)]">
      {/* URL bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] flex-shrink-0">
        <div className="flex items-center gap-1.5 flex-1 min-w-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--color-success)] flex-shrink-0" />
          <span className="text-xs text-[var(--color-text-secondary)] truncate font-mono">{url}</span>
        </div>
        <CopyButton text={url} />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in new tab"
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7M8 1h3m0 0v3m0-3L5 7"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

      {/* iframe — key forces remount when URL or refreshKey changes */}
      <div className="flex-1 relative bg-[var(--color-surface-alt)]">
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          title={appName ?? 'App Preview'}
          className="absolute inset-0 w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
