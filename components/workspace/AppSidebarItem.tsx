'use client';

import { useState, useCallback } from 'react';

interface AppSidebarItemProps {
  id: string;
  name: string;
  url: string | null;
  isActive: boolean;
  isBuilding?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export default function AppSidebarItem({
  name,
  url,
  isActive,
  isBuilding,
  onSelect,
  onDelete,
  onEdit,
}: AppSidebarItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setMenuOpen(false);
      if (confirm(`Delete "${name}"? This cannot be undone.`)) {
        onDelete();
      }
    },
    [name, onDelete],
  );

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setMenuOpen(false);
      onEdit();
    },
    [onEdit],
  );

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
        isActive
          ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)]'
      }`}
    >
      {/* Status dot */}
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          isBuilding
            ? 'bg-[var(--color-warning)] stage-pulse'
            : url
            ? 'bg-[var(--color-success)]'
            : 'bg-[var(--color-border-hover)]'
        }`}
      />

      <span className="flex-1 truncate font-medium">{name}</span>

      {/* Menu trigger */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((o) => !o);
        }}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--color-border)] transition-opacity"
        title="More options"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="3" r="1" fill="currentColor" />
          <circle cx="7" cy="7" r="1" fill="currentColor" />
          <circle cx="7" cy="11" r="1" fill="currentColor" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div
          className="absolute right-2 top-8 z-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg py-1 min-w-[120px]"
          onMouseLeave={() => setMenuOpen(false)}
        >
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)]"
            >
              Open app ↗
            </a>
          )}
          <button
            onClick={handleEdit}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)]"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--color-error)] hover:bg-[var(--color-error-light)]"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
