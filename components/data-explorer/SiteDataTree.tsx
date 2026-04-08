'use client';

import { useState } from 'react';
import { useUserCollections } from '@flowstack/sdk';
import type { UserDataOverview } from '@flowstack/sdk';

interface SiteDataTreeProps {
  overview: UserDataOverview | null;
  selectedCollection: string | null;
  onSelectCollection: (fullName: string, database?: string, siteName?: string) => void;
}

export default function SiteDataTree({ overview, selectedCollection, onSelectCollection }: SiteDataTreeProps) {
  const { collections, groupedBySite, isLoading } = useUserCollections();
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="p-5 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 rounded-lg bg-[var(--color-border)]/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!collections.length) {
    return (
      <div className="p-5 text-xs text-[var(--color-text-tertiary)] text-center">
        No MongoDB collections found. Build an app that stores data to see it here.
      </div>
    );
  }

  const siteIds = Object.keys(groupedBySite);

  const toggleSite = (siteId: string) => {
    setExpandedSites(prev => {
      const next = new Set(prev);
      next.has(siteId) ? next.delete(siteId) : next.add(siteId);
      return next;
    });
  };

  // Auto-expand if only 1-3 sites
  if (expandedSites.size === 0 && siteIds.length <= 3) {
    siteIds.forEach(s => expandedSites.add(s));
  }

  return (
    <div className="p-3 space-y-1">
      {siteIds.map(siteId => {
        const siteCols = groupedBySite[siteId];
        const isExpanded = expandedSites.has(siteId);
        const siteName = siteCols[0]?.site_name || siteId;
        const totalDocs = siteCols.reduce((s, c) => s + c.doc_count, 0);

        return (
          <div key={siteId}>
            <button
              onClick={() => toggleSite(siteId)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-[var(--color-surface-alt)] transition-colors"
            >
              <svg
                width="10" height="10" viewBox="0 0 10 10"
                className={`transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
              >
                <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[var(--color-text)] truncate">{siteName}</p>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">
                  {siteCols.length} collection{siteCols.length !== 1 ? 's' : ''} · {totalDocs.toLocaleString()} docs
                </p>
              </div>
            </button>

            {isExpanded && (
              <div className="ml-5 pl-3 border-l border-[var(--color-border)]/50 space-y-0.5 pb-1">
                {siteCols.map(col => (
                  <button
                    key={col.full_name}
                    onClick={() => onSelectCollection(col.full_name, col.database, siteName)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors ${
                      selectedCollection === col.full_name
                        ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                        : 'hover:bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-mono truncate">{col.name}</span>
                      {col.data_tier === 'shared' && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium flex-shrink-0">
                          shared
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono flex-shrink-0 ml-2">
                      {col.doc_count.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
