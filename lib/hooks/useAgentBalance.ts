'use client';

/**
 * useAgentBalance — polls the backend for AGENT token balance.
 * Local hook (avoids importing @flowstack/sdk/wallet which bundles Privy/WalletConnect).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@flowstack/sdk';

const POLL_INTERVAL_MS = 15_000;

export interface AgentBalance {
  balanceWei: string;
  heldWei: string;
  availableWei: string;
  balance: number;
  available: number;
  buildCredits: number;
}

export function useAgentBalance() {
  const { credentials } = useAuth();
  const [data, setData] = useState<AgentBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_FLOWSTACK_BASE_URL || 'https://sage-api.flowstack.fun';
  const apiKey = credentials?.apiKey;
  const tenantId = credentials?.tenantId;

  // Check if JWT has a wallet_address — skip polling entirely if not
  const hasWallet = (() => {
    if (!apiKey) return false;
    try {
      const payload = JSON.parse(atob(apiKey.split('.')[1]));
      return !!payload.wallet_address;
    } catch { return false; }
  })();

  const fetchBalance = useCallback(async () => {
    if (!apiKey || !hasWallet) return;
    setIsLoading(true);
    setError(null);

    try {
      const resp = await fetch(`${baseUrl}/billing/agent/balance`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      if (resp.status === 400) { setData(null); return; }
      if (!resp.ok) throw new Error(`AGENT balance failed: ${resp.status}`);
      const json = await resp.json();
      setData({
        balanceWei: json.balance_wei,
        heldWei: json.held_wei,
        availableWei: json.available_wei,
        balance: json.agent_balance,
        available: json.agent_available,
        buildCredits: json.build_credits,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch AGENT balance');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, baseUrl, tenantId, hasWallet]);

  useEffect(() => {
    fetchBalance();
    intervalRef.current = setInterval(fetchBalance, POLL_INTERVAL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchBalance]);

  return { data, isLoading, error, refetch: fetchBalance };
}
