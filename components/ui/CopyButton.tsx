'use client';

import { useState, useCallback } from 'react';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors ${
        copied
          ? 'text-[var(--color-success)] bg-[var(--color-success-light)]'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]'
      } ${className}`}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="4" y="1" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <rect x="1" y="3" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" fill="var(--color-surface)" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}
