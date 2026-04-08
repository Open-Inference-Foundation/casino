'use client';

import { useState, useEffect } from 'react';
import { useCreditStatus } from '@/lib/hooks/useCreditStatus';

interface CreditGateModalProps {
  creditCost: number;
  onClose: () => void;
  onOpenWallet: () => void;
}

/**
 * CreditGateModal — shown when user tries to build/edit without enough credits.
 *
 * Two upgrade paths:
 * 1. Connect wallet for AGENT token payments
 * 2. Wait until midnight UTC reset
 */
export default function CreditGateModal({ creditCost, onClose, onOpenWallet }: CreditGateModalProps) {
  const { data: credits } = useCreditStatus();
  const [countdown, setCountdown] = useState('');

  // Countdown to midnight UTC
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setUTCDate(midnight.getUTCDate() + 1);
      midnight.setUTCHours(0, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${h}h ${m}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Out of Credits
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Info */}
        <p className="text-sm text-[var(--color-text-secondary)] mb-1">
          This action costs <span className="font-semibold text-[var(--color-text)]">{creditCost} credits</span>.
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] mb-5">
          You have <span className="font-semibold text-[#d44343]">{credits?.remaining ?? 0}</span> credits remaining today.
        </p>

        {/* CTA: Connect Wallet */}
        <button
          onClick={onOpenWallet}
          className="w-full py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors mb-3"
        >
          Pay with AGENT Tokens
        </button>

        {/* Secondary: Reset timer */}
        <div className="text-center text-xs text-[var(--color-text-tertiary)]">
          Credits reset in <span className="font-medium text-[var(--color-text-secondary)]">{countdown}</span>
        </div>
      </div>
    </div>
  );
}
