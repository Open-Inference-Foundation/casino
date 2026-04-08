'use client';

import { useState, useCallback } from 'react';
import { useFlowstack, useConnections, publishToGitHub } from '@flowstack/sdk';

interface PublishToGitHubProps {
  siteId: string;
  siteName: string;
  liveVersion?: number | null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'my-app';
}

export default function PublishToGitHub({ siteId, siteName, liveVersion }: PublishToGitHubProps) {
  const { credentials, config } = useFlowstack();
  const { connections, connect, isLoading: connectionsLoading } = useConnections();
  const github = (connections as any).github ?? { connected: false };

  const [repoName, setRepoName] = useState(slugify(siteName));
  const [isPrivate, setIsPrivate] = useState(true);
  const [isPushing, setIsPushing] = useState(false);
  const [result, setResult] = useState<{ repoUrl: string; commitSha: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientConfig = { baseUrl: config.baseUrl, tenantId: config.tenantId };

  const handleConnect = useCallback(async () => {
    try {
      await connect('github' as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect GitHub');
    }
  }, [connect]);

  const handlePush = useCallback(async () => {
    if (!credentials || !repoName.trim()) return;
    setIsPushing(true);
    setError(null);
    setResult(null);

    try {
      const res = await publishToGitHub(credentials, siteId, {
        repoName: repoName.trim(),
        isPrivate,
        version: liveVersion ?? undefined,
      }, clientConfig);

      if (res.ok && res.data) {
        setResult(res.data);
      } else {
        setError(res.error || 'Failed to push to GitHub');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to push to GitHub');
    } finally {
      setIsPushing(false);
    }
  }, [credentials, siteId, repoName, isPrivate, liveVersion, clientConfig]);

  return (
    <div className="px-4 py-3 border-t border-[var(--color-border)]">
      <div className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
        GitHub
      </div>

      {connectionsLoading ? (
        <div className="flex items-center gap-2 py-2">
          <span className="w-3 h-3 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] spin" />
          <span className="text-xs text-[var(--color-text-tertiary)]">Checking connection...</span>
        </div>
      ) : !github.connected ? (
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Connect GitHub
        </button>
      ) : (
        <div className="space-y-2">
          {/* Connected user */}
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
            <span>{github.username || 'Connected'}</span>
          </div>

          {/* Repo name input */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-_.]/g, ''))}
              placeholder="repo-name"
              disabled={isPushing}
              className="flex-1 text-xs px-2 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none disabled:opacity-50 font-mono"
            />
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              title={isPrivate ? 'Private repo' : 'Public repo'}
              className="text-[10px] px-2 py-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
            >
              {isPrivate ? 'Private' : 'Public'}
            </button>
          </div>

          {/* Push button */}
          <button
            onClick={handlePush}
            disabled={isPushing || !repoName.trim()}
            className="w-full text-xs px-3 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors"
          >
            {isPushing ? 'Pushing...' : 'Push to GitHub'}
          </button>

          {/* Result */}
          {result && (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-[var(--color-success-light)] border border-[var(--color-success)]/30">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
              <a
                href={result.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--color-success)] hover:underline truncate"
              >
                {result.repoUrl}
              </a>
            </div>
          )}

          {error && (
            <p className="text-[10px] text-[var(--color-error)]">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
