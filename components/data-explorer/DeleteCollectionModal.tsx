'use client';

import { useState } from 'react';

interface DeleteCollectionModalProps {
  collectionName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteCollectionModal({ collectionName, onConfirm, onCancel }: DeleteCollectionModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = confirmText === collectionName;

  const handleDelete = async () => {
    if (!canDelete) return;
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-sm shadow-2xl p-5"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">Delete Collection</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-4">
          This will permanently delete <strong className="text-[var(--color-text)] font-mono">{collectionName}</strong> and
          all its documents. This cannot be undone.
        </p>

        <div className="mb-4">
          <label className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] block mb-1">
            Type "{collectionName}" to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={collectionName}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[#d44343]"
            autoFocus
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
            className="flex-1 py-2 rounded-lg bg-[#d44343] text-white text-xs font-medium disabled:opacity-30 hover:bg-[#c33] transition-colors"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
