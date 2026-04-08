'use client';

/**
 * useCreditStatus — polls the backend for daily free credit status.
 * Local hook (avoids importing @flowstack/sdk/wallet which bundles Privy/WalletConnect).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@flowstack/sdk';

const POLL_INTERVAL_MS = 60_000;

export interface CreditStatus {
  dailyLimit: number;
  usedToday: number;
  remaining: number;
  resetsAt: string;
}

export function useCreditStatus() {
  const { credentials } = useAuth();
  const [data, setData] = useState<CreditStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_FLOWSTACK_BASE_URL || 'https://sage-api.flowstack.fun';
  const apiKey = credentials?.apiKey;
  const tenantId = credentials?.tenantId;
  const userId = credentials?.userId;

  const fetchStatus = useCallback(async () => {
    if (!apiKey || !userId) return;
    setIsLoading(true);
    setError(null);

    try {
      const resp = await fetch(`${baseUrl}/billing/credits/status?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Tenant-ID': tenantId || '',
          'X-User-ID': userId,
        },
      });
      if (!resp.ok) throw new Error(`Credit status failed: ${resp.status}`);
      const json = await resp.json();
      setData({
        dailyLimit: json.daily_limit,
        usedToday: json.used_today,
        remaining: json.remaining,
        resetsAt: json.resets_at,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch credit status');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, baseUrl, tenantId, userId]);

  useEffect(() => {
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchStatus]);

  return { data, isLoading, error, refetch: fetchStatus };
}
