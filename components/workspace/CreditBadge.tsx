'use client';

import { useState } from 'react';
import { useCreditStatus } from '@/lib/hooks/useCreditStatus';
import { useAgentBalance } from '@/lib/hooks/useAgentBalance';
import WalletSettings from './WalletSettings';

/**
 * CreditBadge — shows credit/balance status in the header bar.
 *
 * Free tier users see: "45/60 credits"
 * Token users see: AGENT balance + build credits
 * Clicking opens the WalletSettings panel.
 */
export default function CreditBadge() {
  const { data: credits } = useCreditStatus();
  const { data: agentBalance } = useAgentBalance();
  const [showSettings, setShowSettings] = useState(false);

  const isTokenUser = !!agentBalance;

  return (
    <>
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 text-[var(--color-accent)] transition-colors"
        title="Credits & wallet"
      >
        {/* Coin icon */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
          <text x="7" y="10" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold">$</text>
        </svg>
        {isTokenUser ? (
          <>
            <span className="font-semibold">{agentBalance.buildCredits}</span>
            <span className="hidden sm:inline opacity-70">builds</span>
          </>
        ) : credits ? (
          <>
            <span className="font-semibold">{credits.remaining}</span>
            <span className="hidden sm:inline opacity-70">/ {credits.dailyLimit}</span>
          </>
        ) : (
          <span className="font-semibold">60</span>
        )}
      </button>

      {showSettings && (
        <WalletSettings onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
