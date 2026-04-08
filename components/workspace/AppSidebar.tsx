'use client';

import { useState, useCallback } from 'react';
import AppSidebarItem from './AppSidebarItem';

export interface AppEntry {
  id: string;
  name: string;
  url: string | null;
  isBuilding?: boolean;
}

interface AppSidebarProps {
  apps: AppEntry[];
  selectedAppId: string | null;
  currentUserId?: string;
  onNewApp: () => void;
  onSelectApp: (app: AppEntry) => void;
  onDeleteApp: (id: string) => void;
  onEditApp: (app: AppEntry) => void;
}

export default function AppSidebar({
  apps,
  selectedAppId,
  onNewApp,
  onSelectApp,
  onDeleteApp,
  onEditApp,
}: AppSidebarProps) {
  const [search, setSearch] = useState('');

  const filtered = apps.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDeleteApp(id);
    },
    [onDeleteApp],
  );

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface-alt)] border-r border-[var(--color-border)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-[var(--color-border)]">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
          Apps
        </span>
        <button
          onClick={onNewApp}
          title="New App"
          className="w-6 h-6 rounded flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-accent)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Search (only if 4+ apps) */}
      {apps.length >= 4 && (
        <div className="px-2 pt-2">
          <input
            type="text"
            placeholder="Search apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-1 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      )}

      {/* App list */}
      <div className="flex-1 overflow-y-auto panel-scroll py-2 px-2">
        {filtered.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {apps.length === 0 ? 'No apps yet' : 'No results'}
            </p>
          </div>
        ) : (
          filtered.map((app) => (
            <AppSidebarItem
              key={app.id}
              id={app.id}
              name={app.name}
              url={app.url}
              isActive={app.id === selectedAppId}
              isBuilding={app.isBuilding}
              onSelect={() => onSelectApp(app)}
              onDelete={() => handleDelete(app.id)}
              onEdit={() => onEditApp(app)}
            />
          ))
        )}
      </div>

      {/* Footer — new app button if no apps */}
      {apps.length === 0 && (
        <div className="px-3 pb-3">
          <button
            onClick={onNewApp}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-[var(--color-accent)] bg-[var(--color-accent-light)] rounded-lg hover:opacity-90 transition-opacity"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New App
          </button>
        </div>
      )}
    </div>
  );
}
