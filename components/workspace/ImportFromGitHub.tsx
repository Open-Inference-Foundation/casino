'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFlowstack, useConnections, listGitHubRepos, importFromGitHub } from '@flowstack/sdk';
import type { GitHubRepo } from '@flowstack/sdk';

type ImportState = 'checking' | 'connect' | 'loading-repos' | 'repo-list' | 'importing' | 'done' | 'error';

interface ImportFromGitHubProps {
  onImport: (repoName: string, filesImported: number) => void;
  onClose: () => void;
}

export default function ImportFromGitHub({ onImport, onClose }: ImportFromGitHubProps) {
  const { credentials, config, selectedWorkspace } = useFlowstack();
  const workspaceId = selectedWorkspace?.workspaceId ?? 'default';
  const { connections, connect, refresh } = useConnections();

  const [state, setState] = useState<ImportState>('checking');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState<{ files: number; repo: string } | null>(null);

  const clientConfig = { baseUrl: config.baseUrl, tenantId: config.tenantId };

  // Check connection on mount
  useEffect(() => {
    if (connections.github?.connected) {
      setState('loading-repos');
    } else {
      setState('connect');
    }
  }, [connections.github?.connected]);

  // Fetch repos when entering loading state
  useEffect(() => {
    if (state !== 'loading-repos' || !credentials) return;

    (async () => {
      try {
        const res = await listGitHubRepos(credentials, clientConfig);
        if (res.ok && res.data?.repos) {
          setRepos(res.data.repos);
          setState('repo-list');
        } else {
          setError('Failed to load repositories');
          setState('error');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load repositories');
        setState('error');
      }
    })();
  }, [state, credentials]);

  const handleConnect = useCallback(async () => {
    try {
      await connect('github');
      // Poll until connected (popup closes -> refresh triggers)
      setTimeout(() => refresh(), 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to connect GitHub');
    }
  }, [connect, refresh]);

  const handleImport = useCallback(async (repo: GitHubRepo) => {
    if (!credentials) return;
    setSelectedRepo(repo);
    setState('importing');
    setError('');

    try {
      const res = await importFromGitHub(credentials, {
        repoFullName: repo.full_name,
        branch: repo.default_branch,
        workspaceId,
      }, clientConfig);

      if (res.ok && res.data) {
        setImportResult({ files: res.data.files_imported, repo: repo.full_name });
        setState('done');
      } else {
        setError('Import failed. Please try again.');
        setState('error');
      }
    } catch (err: any) {
      setError(err.message || 'Import failed');
      setState('error');
    }
  }, [credentials, workspaceId, clientConfig]);

  const filteredRepos = search
    ? repos.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(search.toLowerCase())
      )
    : repos;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" className="text-[var(--color-text)]">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <h2 className="text-sm font-semibold text-[var(--color-text)]">Import from GitHub</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 panel-scroll">
          {/* Connect state */}
          {state === 'connect' && (
            <div className="text-center py-8">
              <svg width="40" height="40" viewBox="0 0 16 16" fill="currentColor" className="text-[var(--color-text-tertiary)] mx-auto mb-4">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">Connect your GitHub account to import repositories</p>
              <button
                onClick={handleConnect}
                className="px-5 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-semibold hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                Connect GitHub
              </button>
            </div>
          )}

          {/* Loading repos */}
          {(state === 'checking' || state === 'loading-repos') && (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[var(--color-text-tertiary)]">Loading repositories...</p>
            </div>
          )}

          {/* Repo list */}
          {state === 'repo-list' && (
            <>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search repositories..."
                className="w-full px-3 py-2 mb-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)]"
              />
              <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
                Max 50 files / 500KB per import. Select a repo to import source files.
              </p>
              {filteredRepos.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)] text-center py-4">No repositories found</p>
              ) : (
                <div className="space-y-1.5">
                  {filteredRepos.map(repo => (
                    <button
                      key={repo.full_name}
                      onClick={() => handleImport(repo)}
                      className="w-full text-left px-3.5 py-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)]">{repo.name}</span>
                        <div className="flex items-center gap-2">
                          {repo.language && (
                            <span className="text-[10px] font-medium text-[var(--color-text-tertiary)] px-1.5 py-0.5 rounded bg-[var(--color-surface-alt)]">
                              {repo.language}
                            </span>
                          )}
                          {repo.private && (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-[var(--color-text-tertiary)]">
                              <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                              <path d="M4 5V3a2 2 0 014 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                      {repo.description && (
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-1 line-clamp-1">{repo.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Importing */}
          {state === 'importing' && selectedRepo && (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-[var(--color-text)]">Importing {selectedRepo.name}...</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Fetching files from {selectedRepo.default_branch} branch</p>
            </div>
          )}

          {/* Done */}
          {state === 'done' && importResult && (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center mx-auto mb-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5L13 5" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--color-text)]">
                Imported {importResult.files} files from {importResult.repo}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1 mb-5">
                Click below to build a Casino app from this code
              </p>
              <button
                onClick={() => onImport(importResult.repo, importResult.files)}
                className="px-5 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-semibold hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                Build from this code
              </button>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--color-error)] mb-3">{error}</p>
              <button
                onClick={() => {
                  setError('');
                  setState(connections.github?.connected ? 'loading-repos' : 'connect');
                }}
                className="px-4 py-1.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
