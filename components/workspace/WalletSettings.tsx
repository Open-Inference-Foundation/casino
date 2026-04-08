'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi';
import { injected } from 'wagmi';
import { useAuth, useFlowstack } from '@flowstack/sdk';
import { useCreditStatus } from '@/lib/hooks/useCreditStatus';
import { useAgentBalance } from '@/lib/hooks/useAgentBalance';

interface WalletSettingsProps {
  onClose: () => void;
}

/**
 * WalletSettings — panel for managing credits and wallet connection.
 */
export default function WalletSettings({ onClose }: WalletSettingsProps) {
  const { credentials } = useAuth();
  const { setCredentials } = useFlowstack();
  const { data: credits } = useCreditStatus();
  const { data: agentBalance } = useAgentBalance();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [hasInjectedProvider, setHasInjectedProvider] = useState(false);

  const { address: connectedAddress, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  // Check for injected provider (MetaMask, etc.) on mount
  useEffect(() => {
    setHasInjectedProvider(
      typeof window !== 'undefined' && !!(window as any).ethereum
    );
  }, []);

  // Check JWT for existing wallet_address
  useEffect(() => {
    if (!credentials?.apiKey) return;
    try {
      const payload = JSON.parse(atob(credentials.apiKey.split('.')[1]));
      if (payload.wallet_address) {
        setWalletAddress(payload.wallet_address);
      }
    } catch {
      // ignore
    }
  }, [credentials]);

  const handleConnectWallet = useCallback(async () => {
    setIsLinking(true);
    setLinkError(null);

    try {
      // 1. Connect wallet — use injected (MetaMask) if available, else WalletConnect
      let address = connectedAddress;
      if (!isConnected || !address) {
        // Find the right connector: injected for desktop with MetaMask, WalletConnect for mobile/no extension
        const connector = hasInjectedProvider
          ? connectors.find(c => c.id === 'injected') || connectors[0]
          : connectors.find(c => c.id === 'walletConnect') || connectors[0];
        const result = await connectAsync({ connector });
        address = result.accounts[0];
      }
      if (!address) throw new Error('No wallet connected');

      // 2. Must be signed in
      if (!credentials?.apiKey) throw new Error('Sign in with Google or email first, then connect your wallet.');

      const baseUrl = process.env.NEXT_PUBLIC_FLOWSTACK_BASE_URL || 'https://sage-api.flowstack.fun';

      // 3. Get nonce
      const nonceResp = await fetch(`${baseUrl}/auth/wallet/nonce`);
      if (!nonceResp.ok) throw new Error('Failed to get nonce');
      const { nonce } = await nonceResp.json();

      // 4. SIWE message (strict EIP-4361 format)
      const domain = window.location.host;
      const origin = window.location.origin;
      const issuedAt = new Date().toISOString();
      // Address must be EIP-55 checksummed
      const { getAddress } = await import('viem');
      const checksumAddress = getAddress(address);
      const siweMessage = `${domain} wants you to sign in with your Ethereum account:\n${checksumAddress}\n\nLink wallet to your Casino account\n\nURI: ${origin}\nVersion: 1\nChain ID: 42161\nNonce: ${nonce}\nIssued At: ${issuedAt}`;

      // 5. Sign
      const signature = await signMessageAsync({ message: siweMessage });

      // 6. Link wallet to existing account
      const linkResp = await fetch(`${baseUrl}/auth/wallet/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.apiKey}`,
          'X-Tenant-ID': credentials.tenantId || '',
        },
        body: JSON.stringify({ message: siweMessage, signature }),
      });

      if (!linkResp.ok) {
        const err = await linkResp.json();
        throw new Error(err.detail || 'Wallet linking failed');
      }

      const data = await linkResp.json();

      // 7. Update credentials via SDK (persists to localStorage + updates context)
      setCredentials({
        apiKey: data.session_token,
        tenantId: data.tenant_id,
        userId: data.user_id,
        expiresAt: data.expires_at,
      });

      setWalletAddress(data.wallet_address);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to connect wallet';
      // Clean up common wagmi error messages
      if (msg.includes('Provider not found')) {
        setLinkError('No wallet detected. Please install MetaMask.');
      } else if (msg.includes('User rejected')) {
        setLinkError('Connection cancelled.');
      } else {
        setLinkError(msg);
      }
    } finally {
      setIsLinking(false);
    }
  }, [connectedAddress, isConnected, connectAsync, signMessageAsync, hasInjectedProvider, credentials, setCredentials, onClose]);

  const usedPct = credits ? Math.min(100, (credits.usedToday / credits.dailyLimit) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-t-2xl sm:rounded-2xl p-5 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--color-text)]">Credits & Wallet</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Daily credits */}
        <div className="mb-5">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs text-[var(--color-text-secondary)]">Daily credits</span>
            <span className="text-xs text-[var(--color-text-tertiary)]">
              {credits ? `${credits.remaining} remaining` : '60 remaining'}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${usedPct}%`,
                backgroundColor: usedPct > 90 ? '#d44343' : usedPct > 70 ? '#d4a843' : 'var(--color-accent)',
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[var(--color-text-tertiary)]">
              {credits?.usedToday ?? 0} used
            </span>
            <span className="text-[10px] text-[var(--color-text-tertiary)]">
              {credits?.dailyLimit ?? 60} total
            </span>
          </div>
        </div>

        {/* Wallet section */}
        <div className="border-t border-[var(--color-border)] pt-4">
          {walletAddress ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
              {agentBalance && (
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-semibold text-[var(--color-text)]">
                    {agentBalance.buildCredits}
                  </span>
                  <span className="text-sm text-[var(--color-text-tertiary)]">build credits</span>
                </div>
              )}
              <p className="text-[10px] text-[var(--color-text-tertiary)]">
                AGENT balance: {agentBalance?.balance?.toFixed(2) ?? '0'} tokens
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                Connect a wallet to pay with AGENT tokens beyond your daily free credits.
              </p>

              <button
                onClick={handleConnectWallet}
                disabled={isLinking}
                className="w-full py-2 rounded-lg border border-[var(--color-accent)] text-[var(--color-accent)] text-sm font-medium hover:bg-[var(--color-accent)]/10 transition-colors disabled:opacity-50"
              >
                {isLinking ? 'Connecting...' : 'Connect Wallet'}
              </button>
              {!hasInjectedProvider && (
                <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1.5 text-center">
                  Opens WalletConnect — scan with your mobile wallet
                </p>
              )}

              {linkError && (
                <p className="text-xs text-[#d44343] mt-2">{linkError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
