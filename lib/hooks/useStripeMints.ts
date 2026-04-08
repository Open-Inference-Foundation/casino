'use client';

/**
 * useStripeMints — fetches the user's Stripe → AGENT mint records.
 *
 * Used by WalletSettingsContent to surface pending_wallet / failed mints
 * so users can recover AGENT they paid for but didn't receive. Unlike
 * useCreditStatus this does not poll — mints change infrequently and the
 * user can refetch by re-opening the panel.
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@flowstack/sdk';
import { API_BASE_URL } from '@/lib/constants';

export interface MintRecord {
  stripeSessionId: string;
  usdCents: number;
  agentAmountWei: string;
  status: 'pending' | 'pending_wallet' | 'submitted' | 'confirmed' | 'failed' | string;
  walletAddress: string;
  createdAt: string;
  submittedAt?: string;
  mintTxHash?: string;
  depositTxHash?: string;
  error?: string;
}

export function useStripeMints() {
  const { credentials } = useAuth();
  const [data, setData] = useState<MintRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  const baseUrl = API_BASE_URL;
  const apiKey = credentials?.apiKey;
  const tenantId = credentials?.tenantId;

  const fetchMints = useCallback(async () => {
    if (!apiKey) return;
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${baseUrl}/billing/stripe/mints`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      if (!resp.ok) throw new Error(`Mints fetch failed: ${resp.status}`);
      const json = (await resp.json()) as Array<Record<string, unknown>>;
      setData(
        json.map((m) => ({
          stripeSessionId: String(m.stripe_session_id ?? ''),
          usdCents: Number(m.usd_cents ?? 0),
          agentAmountWei: String(m.agent_amount_wei ?? '0'),
          status: String(m.status ?? 'unknown'),
          walletAddress: String(m.wallet_address ?? ''),
          createdAt: String(m.created_at ?? ''),
          submittedAt: m.submitted_at ? String(m.submitted_at) : undefined,
          mintTxHash: m.mint_tx_hash ? String(m.mint_tx_hash) : undefined,
          depositTxHash: m.deposit_tx_hash ? String(m.deposit_tx_hash) : undefined,
          error: m.error ? String(m.error) : undefined,
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch mints');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, baseUrl, tenantId]);

  const retryMint = useCallback(
    async (sessionId: string) => {
      if (!apiKey) return;
      setRetrying(sessionId);
      try {
        const resp = await fetch(`${baseUrl}/billing/stripe/mint-retry`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-Tenant-ID': tenantId || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_id: sessionId }),
        });
        if (!resp.ok) throw new Error(`Retry failed: ${resp.status}`);
        await fetchMints();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Retry failed');
      } finally {
        setRetrying(null);
      }
    },
    [apiKey, baseUrl, tenantId, fetchMints]
  );

  useEffect(() => {
    fetchMints();
  }, [fetchMints]);

  return { data, isLoading, error, refetch: fetchMints, retryMint, retrying };
}
