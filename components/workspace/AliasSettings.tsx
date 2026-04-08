'use client';

import { useState, useCallback } from 'react';
import { useFlowstack } from '@flowstack/sdk';
import { setSiteAlias, removeSiteAlias } from '@flowstack/sdk';
import CopyButton from '@/components/ui/CopyButton';

interface AliasSettingsProps {
  siteId: string;
  currentAlias?: string | null;
  onAliasChanged: () => void;
}

const ALIAS_PATTERN = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;

export default function AliasSettings({ siteId, currentAlias, onAliasChanged }: AliasSettingsProps) {
  const { credentials, config } = useFlowstack();
  const [alias, setAlias] = useState(currentAlias ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientConfig = { baseUrl: config.baseUrl, tenantId: config.tenantId };
  const aliasUrl = currentAlias ? `https://${currentAlias}.casino.flowstack.fun` : null;

  const handleSet = useCallback(async () => {
    if (!credentials || !alias.trim()) return;
    const trimmed = alias.trim().toLowerCase();

    if (!ALIAS_PATTERN.test(trimmed)) {
      setError('Must be 3-63 characters: lowercase letters, numbers, and hyphens');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await setSiteAlias(credentials, siteId, trimmed, clientConfig);
      if (res.ok) {
        onAliasChanged();
      } else {
        setError(res.error || 'Failed to set alias');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set alias');
    } finally {
      setIsSubmitting(false);
    }
  }, [credentials, siteId, alias, clientConfig, onAliasChanged]);

  const handleRemove = useCallback(async () => {
    if (!credentials) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await removeSiteAlias(credentials, siteId, clientConfig);
      if (res.ok) {
        setAlias('');
        onAliasChanged();
      } else {
        setError(res.error || 'Failed to remove alias');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove alias');
    } finally {
      setIsSubmitting(false);
    }
  }, [credentials, siteId, clientConfig, onAliasChanged]);

  return (
    <div className="px-4 py-3 border-t border-[var(--color-border)]">
      <div className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
        Custom Alias
      </div>

      {aliasUrl && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded bg-[var(--color-surface-alt)] border border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-text-secondary)] truncate font-mono flex-1">{aliasUrl}</span>
          <CopyButton text={aliasUrl} />
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={alias}
          onChange={(e) => {
            setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
            setError(null);
          }}
          placeholder="my-app-name"
          disabled={isSubmitting}
          className="flex-1 text-xs px-2 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSet}
          disabled={isSubmitting || !alias.trim()}
          className="text-[10px] px-2 py-1.5 rounded bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? '...' : 'Set'}
        </button>
        {currentAlias && (
          <button
            onClick={handleRemove}
            disabled={isSubmitting}
            className="text-[10px] px-2 py-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] hover:border-[var(--color-error)] disabled:opacity-50 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {error && (
        <p className="text-[10px] text-[var(--color-error)] mt-1">{error}</p>
      )}

      <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">
        .casino.flowstack.fun
      </p>
    </div>
  );
}
