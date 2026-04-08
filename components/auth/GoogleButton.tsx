'use client';

import { useCallback, useState } from 'react';
import { useAuth } from '@flowstack/sdk';

export default function GoogleButton() {
  const { googleSignIn, isLoading, error: authError } = useAuth();
  const [clicked, setClicked] = useState(false);

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    setClicked(true);
    try {
      await googleSignIn();
      // googleSignIn sets window.location.href → page navigates to Google.
      // Nothing to do here — browser is navigating away.
    } catch {
      // useAuth sets its own error state — no need to duplicate.
      setClicked(false);
    }
  }, [googleSignIn]);

  // Only show error if user clicked and useAuth reported a Google-related error
  const showError = clicked && !isLoading && authError && authError.includes('Google');

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-alt)] disabled:opacity-50 transition-colors"
      >
        {isLoading && clicked ? (
          <span className="w-4 h-4 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] spin" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
        )}
        Continue with Google
      </button>
      {showError && <p className="text-xs text-[var(--color-error)]">{authError}</p>}
    </div>
  );
}
