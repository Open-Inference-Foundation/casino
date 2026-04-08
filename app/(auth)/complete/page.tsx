'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFlowstack } from '@flowstack/sdk';

function AuthCompleteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCredentials } = useFlowstack();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('user_id');
    const expiresAt = searchParams.get('expires_at') ?? undefined;

    if (!token || !userId) {
      router.replace('/login?auth_error=invalid_token');
      return;
    }

    // Decode tenant_id and email from JWT — authoritative source of truth
    let tenantId = searchParams.get('tenant_id') ?? '';
    let email = searchParams.get('email') ?? '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      tenantId = payload.tenant_id || tenantId;
      email = payload.email || email;
    } catch { /* ignore decode errors */ }

    setCredentials({
      apiKey: token,
      tenantId,
      userId,
      email,
      expiresAt,
    });
    router.replace('/workspace');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex items-center justify-center h-24">
      <span className="text-sm text-[var(--color-text-secondary)]">Completing sign-in…</span>
    </div>
  );
}

export default function AuthCompletePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-24">
        <span className="text-sm text-[var(--color-text-secondary)]">Loading…</span>
      </div>
    }>
      <AuthCompleteInner />
    </Suspense>
  );
}
