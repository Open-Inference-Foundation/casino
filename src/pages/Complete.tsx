import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFlowstack } from '@flowstack/sdk';
import { SEO } from '../components/SEO';

export default function Complete() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCredentials } = useFlowstack();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('user_id');
    const expiresAt = searchParams.get('expires_at') ?? undefined;

    if (!token || !userId) {
      navigate('/login?auth_error=invalid_token', { replace: true });
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
    navigate('/workspace', { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SEO
        title="Completing sign-in"
        description="Completing Ca$ino Builder sign-in. One moment…"
        canonicalUrl="/complete"
        noIndex
      />
      <div className="flex items-center justify-center h-24">
        <span className="text-sm text-[var(--color-text-secondary)]">Completing sign-in…</span>
      </div>
    </>
  );
}
