import { useState, useCallback } from 'react';
import { useAccount, useConnect, useSignMessage } from 'wagmi';
import { useFlowstack } from '@flowstack/sdk';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/constants';

const BASE_URL = API_BASE_URL;

/**
 * SIWE login hook — wallet-first authentication via /auth/wallet/verify.
 *
 * Creates a wallet-only session (no existing account required).
 * Only show the button when useWalletBrowser().hasInjectedProvider is true.
 */
export function useSiweAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address: connectedAddress, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const { setCredentials } = useFlowstack();
  const navigate = useNavigate();

  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Connect wallet — always use injected provider (only shown when available)
      let address = connectedAddress;
      if (!isConnected || !address) {
        const connector = connectors.find((c) => c.id === 'injected') ?? connectors[0];
        if (!connector) throw new Error('No wallet connector available');
        const result = await connectAsync({ connector });
        address = result.accounts[0];
      }
      if (!address) throw new Error('No wallet address returned');

      // 2. Get nonce (public, no auth required)
      const nonceResp = await fetch(`${BASE_URL}/auth/wallet/nonce`);
      if (!nonceResp.ok) throw new Error('Failed to get nonce');
      const { nonce } = await nonceResp.json();

      // 3. Build strict EIP-4361 SIWE message
      const domain = window.location.host;
      const origin = window.location.origin;
      const issuedAt = new Date().toISOString();
      const { getAddress } = await import('viem');
      const checksumAddress = getAddress(address);
      const siweMessage =
        `${domain} wants you to sign in with your Ethereum account:\n` +
        `${checksumAddress}\n\n` +
        `Sign in to Casino\n\n` +
        `URI: ${origin}\n` +
        `Version: 1\n` +
        `Chain ID: 42161\n` +
        `Nonce: ${nonce}\n` +
        `Issued At: ${issuedAt}`;

      // 4. Sign
      const signature = await signMessageAsync({ message: siweMessage });

      // 5. Verify — creates or loads wallet-first account, issues JWT (no existing account required)
      const verifyResp = await fetch(`${BASE_URL}/auth/wallet/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: siweMessage, signature }),
      });

      if (!verifyResp.ok) {
        const err = await verifyResp.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail || 'Wallet sign-in failed');
      }

      const data = await verifyResp.json() as {
        session_token: string;
        tenant_id: string;
        user_id: string;
        expires_at?: string;
      };

      // 6. Persist session — JWT contains wallet_address so CreditBadge shows AGENT balance immediately
      setCredentials({
        apiKey: data.session_token,
        tenantId: data.tenant_id,
        userId: data.user_id,
        expiresAt: data.expires_at,
      });

      navigate('/workspace');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Wallet sign-in failed';
      if (msg.includes('Provider not found')) {
        setError('No wallet detected. Install a wallet app and try again.');
      } else if (/user rejected|rejected/i.test(msg)) {
        setError('Sign-in cancelled.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [connectedAddress, isConnected, connectAsync, connectors, signMessageAsync, setCredentials, navigate]);

  return { login, isLoading, error };
}
