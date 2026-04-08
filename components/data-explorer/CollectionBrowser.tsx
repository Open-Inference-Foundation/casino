'use client';

import { useState } from 'react';
import { useCollectionExplorer } from '@flowstack/sdk';
import DeleteCollectionModal from './DeleteCollectionModal';

interface CollectionBrowserProps {
  collection: string;
  database?: string;
  siteName?: string;
  onBack: () => void;
}

export default function CollectionBrowser({ collection, database, siteName, onBack }: CollectionBrowserProps) {
  const {
    documents, total, schema, isLoading, error,
    page, pageSize, setPage, refresh, exportAs, deleteCollection,
  } = useCollectionExplorer(collection, { database });

  const [showDelete, setShowDelete] = useState(false);
  const [filterText, setFilterText] = useState('');

  // Parse collection name
  const shortName = collection.includes('__') ? collection.split('__').pop() : collection;
  const totalPages = Math.ceil(total / pageSize);

  // Get column headers from schema or first document
  const columns = schema?.fields?.map(f => f.name) ||
    (documents.length > 0 ? Object.keys(documents[0]) : []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <h2 className="text-sm font-semibold text-[var(--color-text)] font-mono truncate">{shortName}</h2>
          </div>
          <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
            {siteName && `${siteName} · `}{total.toLocaleString()} document{total !== 1 ? 's' : ''}
            {schema && ` · ${schema.fields.length} fields`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => exportAs('csv')}
            className="text-[11px] px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
          >
            CSV
          </button>
          <button
            onClick={() => exportAs('json')}
            className="text-[11px] px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
          >
            JSON
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="text-[11px] px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[#d44343] hover:text-[#d44343] transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Schema bar */}
      {schema && schema.fields.length > 0 && (
        <div className="px-4 py-2 border-b border-[var(--color-border)]/50 flex-shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {schema.fields.slice(0, 12).map(f => (
              <span key={f.name} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] font-mono">
                {f.name}: <span className="text-[var(--color-accent)]">{f.type}</span>
              </span>
            ))}
            {schema.fields.length > 12 && (
              <span className="text-[10px] text-[var(--color-text-tertiary)]">+{schema.fields.length - 12} more</span>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-2 text-xs text-[var(--color-error,#d44343)]">{error}</div>
      )}

      {/* Document table */}
      <div className="flex-1 overflow-auto panel-scroll">
        {isLoading ? (
          <div className="p-5 space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 rounded bg-[var(--color-border)]/30 animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--color-text-tertiary)] text-sm">
            No documents in this collection
          </div>
        ) : (
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-[var(--color-surface)]">
              <tr className="border-b border-[var(--color-border)]">
                {columns.slice(0, 8).map(col => (
                  <th key={col} className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)] whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc: any, i: number) => (
                <tr key={doc._id || i} className="border-b border-[var(--color-border)]/30 hover:bg-[var(--color-surface-alt)]/30">
                  {columns.slice(0, 8).map(col => (
                    <td key={col} className="px-3 py-1.5 text-[var(--color-text)] font-mono max-w-[200px] truncate">
                      {formatCell(doc[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--color-border)] flex-shrink-0">
          <span className="text-[10px] text-[var(--color-text-tertiary)]">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total.toLocaleString()}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="text-xs px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] disabled:opacity-30 hover:border-[var(--color-accent)] transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="text-xs px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] disabled:opacity-30 hover:border-[var(--color-accent)] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDelete && (
        <DeleteCollectionModal
          collectionName={shortName || collection}
          onConfirm={async () => {
            const ok = await deleteCollection();
            if (ok) onBack();
          }}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}

function formatCell(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 80);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value).slice(0, 80);
}
