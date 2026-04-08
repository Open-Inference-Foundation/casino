'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi';
import { injected } from 'wagmi';
import { useAuth, useFlowstack } from '@flowstack/sdk';
import { useCreditStatus } from '@/lib/hooks/useCreditStatus';
import { useAgentBalance } from '@/lib/hooks/useAgentBalance';
import { useWalletBrowser } from '@/lib/hooks/useWalletBrowser';
import { useStripeMints } from '@/lib/hooks/useStripeMints';
import { API_BASE_URL } from '@/lib/constants';

function WalletExplainer({
  isLinking,
  linkError,
  onConnect,
}: {
  isLinking: boolean;
  linkError: string | null;
  onConnect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="flex items-start gap-2 mb-3">
        <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-[var(--color-accent)]/15 flex items-center justify-center">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <circle cx="4" cy="4" r="3" stroke="var(--color-accent)" strokeWidth="1.2" />
            <path d="M4 3v2.5" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="4" cy="2.2" r="0.4" fill="var(--color-accent)" />
          </svg>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          AGENT tokens let co-op members pay for builds directly from their token balance.
          {' '}
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-[var(--color-accent)] hover:underline"
          >
            {expanded ? 'Less' : "What\u2019s a wallet?"}
          </button>
        </p>
      </div>

      {expanded && (
        <div className="mb-3 p-3 rounded-lg bg-[var(--color-border)]/30 text-[10px] text-[var(--color-text-tertiary)] leading-relaxed space-y-1.5">
          <p>A <strong className="text-[var(--color-text-secondary)]">crypto wallet</strong> is software that holds digital tokens — similar to how a bank app holds dollars, but you control it directly without an intermediary.</p>
          <p>Connecting one here links your token balance to your Casino account so builds can be charged to it instead of your daily credit allowance.</p>
          <p>You don&apos;t need a wallet to use Casino — <strong className="text-[var(--color-text-secondary)]">Buy Credits</strong> above works with any credit card.</p>
        </div>
      )}

      <button
        onClick={onConnect}
        disabled={isLinking}
        className="w-full py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-50"
      >
        {isLinking ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {linkError && (
        <p className="text-xs text-[#d44343] mt-2">{linkError}</p>
      )}
    </div>
  );
}

const PACKAGES = [
  { id: 'starter', label: 'Starter', credits: 160, price: '$15' },
  { id: 'builder', label: 'Builder Pro', credits: 550, price: '$49' },
  { id: 'scale',   label: 'Scale / Agency', credits: 1200, price: '$99' },
] as const;

type PackageId = typeof PACKAGES[number]['id'];

interface WalletSettingsContentProps {
  /** Called when an action (wallet link, buy credits redirect) should close the panel. */
  onClose: () => void;
}

/**
 * WalletSettingsContent — the inner panel content (no fixed overlay).
 * Rendered by WalletSettings (standalone overlay) and BuilderSettings (wallet tab).
 */
export default function WalletSettingsContent({ onClose }: WalletSettingsContentProps) {
  const { credentials } = useAuth();
  const { setCredentials } = useFlowstack();
  const { data: credits } = useCreditStatus();
  const { data: agentBalance } = useAgentBalance();
  const { data: mints, retryMint, retrying } = useStripeMints();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const { isWalletBrowser, hasInjectedProvider, walletName } = useWalletBrowser();
  const [showPackages, setShowPackages] = useState(false);
  const [buyingPkg, setBuyingPkg] = useState<PackageId | null>(null);

  const baseUrl = API_BASE_URL;

  const handleBuyCredits = useCallback(async (pkg: PackageId) => {
    if (!credentials?.apiKey) return;
    setBuyingPkg(pkg);
    try {
      const res = await fetch(`${baseUrl}/billing/stripe/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ package: pkg }),
      });
      if (!res.ok) throw new Error(`Checkout failed: ${res.status}`);
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      console.error('[WalletSettings] Stripe checkout error:', e);
      setBuyingPkg(null);
    }
  }, [credentials, baseUrl]);

  const { address: connectedAddress, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

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
      let address = connectedAddress;
      if (!isConnected || !address) {
        const connector = (hasInjectedProvider || isWalletBrowser)
          ? connectors.find(c => c.id === 'injected') ?? connectors[0]
          : connectors.find(c => c.id === 'walletConnect') ?? connectors[0];
        const result = await connectAsync({ connector });
        address = result.accounts[0];
      }
      if (!address) throw new Error('No wallet connected');

      if (!credentials?.apiKey) throw new Error('Sign in with Google or email first, then connect your wallet.');

      const nonceResp = await fetch(`${baseUrl}/auth/wallet/nonce`);
      if (!nonceResp.ok) throw new Error('Failed to get nonce');
      const { nonce } = await nonceResp.json();

      const domain = window.location.host;
      const origin = window.location.origin;
      const issuedAt = new Date().toISOString();
      const { getAddress } = await import('viem');
      const checksumAddress = getAddress(address);
      const siweMessage = `${domain} wants you to sign in with your Ethereum account:\n${checksumAddress}\n\nLink wallet to your Casino account\n\nURI: ${origin}\nVersion: 1\nChain ID: 42161\nNonce: ${nonce}\nIssued At: ${issuedAt}`;

      const signature = await signMessageAsync({ message: siweMessage });

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
      if (msg.includes('Provider not found')) {
        setLinkError('No wallet detected. Install a wallet app and try again.');
      } else if (msg.includes('User rejected')) {
        setLinkError('Connection cancelled.');
      } else {
        setLinkError(msg);
      }
    } finally {
      setIsLinking(false);
    }
  }, [connectedAddress, isConnected, connectAsync, signMessageAsync, hasInjectedProvider, isWalletBrowser, credentials, setCredentials, onClose, baseUrl, connectors]);

  const usedPct = credits ? Math.min(100, (credits.usedToday / credits.dailyLimit) * 100) : 0;

  return (
    <div className="p-5">
      {/* Purchased credits — shown when balance > 0 */}
      {(credits?.purchasedRemaining ?? 0) > 0 && (
        <div className="mb-4 px-3 py-2.5 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-secondary)]">Purchased credits</span>
          <span className="text-sm font-semibold text-[var(--color-accent)]">
            {credits!.purchasedRemaining.toLocaleString()} remaining
          </span>
        </div>
      )}

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

      {/* Buy credits */}
      <div className="border-t border-[var(--color-border)] pt-4 mb-4">
        {!showPackages ? (
          <button
            onClick={() => setShowPackages(true)}
            className="w-full py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Buy Credits
          </button>
        ) : (
          <div className="space-y-2">
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handleBuyCredits(pkg.id)}
                disabled={buyingPkg === pkg.id}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-colors disabled:opacity-50 text-sm"
              >
                <span className="text-[var(--color-text)]">
                  {pkg.label} — {pkg.credits.toLocaleString()} credits
                </span>
                <span className="font-semibold text-[var(--color-accent)]">
                  {buyingPkg === pkg.id ? '...' : pkg.price}
                </span>
              </button>
            ))}
            <button
              onClick={() => setShowPackages(false)}
              className="w-full text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors py-1"
            >
              Cancel
            </button>
          </div>
        )}
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
                <span className="text-sm text-[var(--color-text-tertiary)]">credits</span>
              </div>
            )}
            <p className="text-[10px] text-[var(--color-text-tertiary)]">
              AGENT balance: {agentBalance?.balance?.toFixed(2) ?? '0'} tokens
            </p>
          </div>
        ) : isWalletBrowser ? (
          <div>
            <button
              onClick={handleConnectWallet}
              disabled={isLinking}
              className="w-full py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium disabled:opacity-50"
            >
              {isLinking ? 'Connecting...' : `Connect${walletName && walletName !== 'unknown' ? ` with ${walletName[0].toUpperCase()}${walletName.slice(1)}` : ' Your Wallet'}`}
            </button>
            {linkError && (
              <p className="text-xs text-red-400 mt-2">{linkError}</p>
            )}
          </div>
        ) : (
          <WalletExplainer
            isLinking={isLinking}
            linkError={linkError}
            onConnect={handleConnectWallet}
          />
        )}
      </div>

      {/* Pending AGENT mint recovery — only rendered when there's something actionable */}
      {mints && mints.some((m) => m.status === 'pending_wallet' || m.status === 'failed') && (
        <div className="border-t border-[var(--color-border)] pt-4 mt-4">
          <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
            Pending AGENT Mints
          </p>
          <div className="space-y-2">
            {mints
              .filter((m) => m.status === 'pending_wallet' || m.status === 'failed')
              .map((m) => (
                <div
                  key={m.stripeSessionId}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--color-border)]/20 border border-[var(--color-border)]"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--color-text)]">
                      ${(m.usdCents / 100).toFixed(2)} payment
                    </p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">
                      {m.status === 'pending_wallet'
                        ? 'Connect a wallet to receive AGENT'
                        : 'Mint failed — tap Retry'}
                    </p>
                  </div>
                  {m.status === 'failed' && (
                    <button
                      onClick={() => retryMint(m.stripeSessionId)}
                      disabled={retrying === m.stripeSessionId}
                      className="ml-2 text-xs text-[var(--color-accent)] hover:underline disabled:opacity-50 flex-shrink-0"
                    >
                      {retrying === m.stripeSessionId ? '...' : 'Retry'}
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
