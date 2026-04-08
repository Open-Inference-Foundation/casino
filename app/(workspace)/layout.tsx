'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFlowstackOptional } from '@flowstack/sdk';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const ctx = useFlowstackOptional();
  const router = useRouter();

  // Redirect to login when not authenticated
  useEffect(() => {
    if (ctx?.isInitialized && !ctx.isAuthenticated) {
      router.replace('/login');
    }
  }, [ctx?.isInitialized, ctx?.isAuthenticated, router]);

  // Global 401 handler — when any API call returns 401, clear credentials and redirect
  useEffect(() => {
    function handle401(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.status === 401) {
        ctx?.logout?.();
        router.replace('/login');
      }
    }
    window.addEventListener('flowstack:auth-error', handle401);
    return () => window.removeEventListener('flowstack:auth-error', handle401);
  }, [ctx, router]);

  if (!ctx?.isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-bg)]">
        <span className="w-6 h-6 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] spin" />
      </div>
    );
  }

  if (!ctx.isAuthenticated) return null;

  return <>{children}</>;
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
