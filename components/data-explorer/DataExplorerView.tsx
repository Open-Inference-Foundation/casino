'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataOverview } from '@flowstack/sdk';
import WorkspaceTree from './WorkspaceTree';
import SiteDataTree from './SiteDataTree';
import CollectionBrowser from './CollectionBrowser';

type Tab = 'workspaces' | 'sites';

export default function DataExplorerView() {
  const navigate = useNavigate();
  const { overview, isLoading, error, refresh } = useDataOverview();
  const [activeTab, setActiveTab] = useState<Tab>('sites');
  const [selectedCollection, setSelectedCollection] = useState<{
    fullName: string;
    database?: string;
    siteName?: string;
  } | null>(null);

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/workspace')}
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-base font-semibold text-[var(--color-text)]">My Data</h1>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)] transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Summary cards */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-4 border-b border-[var(--color-border)] flex-shrink-0">
          <SummaryCard label="Workspaces" value={overview.workspaces.length} />
          <SummaryCard label="Sites" value={overview.sites.length} />
          <SummaryCard label="Collections" value={overview.mongodb_summary.total_collections} />
          <SummaryCard label="Documents" value={overview.mongodb_summary.total_documents} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-5 py-3 text-xs text-[var(--color-error,#d44343)]">{error}</div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 px-5 py-2 border-b border-[var(--color-border)] flex-shrink-0">
        {(['sites', 'workspaces'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelectedCollection(null); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]'
            }`}
          >
            {tab === 'sites' ? 'Site Data' : 'Workspaces'}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left panel: tree */}
        <div className="w-72 border-r border-[var(--color-border)] overflow-y-auto panel-scroll flex-shrink-0">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 rounded-lg bg-[var(--color-border)]/30 animate-pulse" />
              ))}
            </div>
          ) : activeTab === 'sites' ? (
            <SiteDataTree
              overview={overview}
              selectedCollection={selectedCollection?.fullName || null}
              onSelectCollection={(fullName, database, siteName) =>
                setSelectedCollection({ fullName, database, siteName })
              }
            />
          ) : (
            <WorkspaceTree overview={overview} />
          )}
        </div>

        {/* Right panel: collection browser or empty state */}
        <div className="flex-1 overflow-y-auto panel-scroll">
          {selectedCollection ? (
            <CollectionBrowser
              collection={selectedCollection.fullName}
              database={selectedCollection.database}
              siteName={selectedCollection.siteName}
              onBack={() => setSelectedCollection(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--color-text-tertiary)] text-sm">
              {activeTab === 'sites'
                ? 'Select a collection to browse documents'
                : 'Select a workspace to view artifacts'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/30 p-3">
      <p className="text-lg font-semibold text-[var(--color-text)]">{value.toLocaleString()}</p>
      <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider">{label}</p>
    </div>
  );
}
