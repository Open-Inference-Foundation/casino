import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFlowstack, googleLogin } from '@flowstack/sdk';

/**
 * Google OAuth callback handler.
 * Google redirects here with ?code=...&state=...
 * We exchange the code for a session token via the backend, then redirect to workspace.
 */
export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCredentials, config } = useFlowstack();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      setError('No authorization code received from Google.');
      return;
    }

    // Verify state matches what we stored (CSRF protection)
    const storedState = sessionStorage.getItem('flowstack:oauth_state');
    if (storedState && state !== storedState) {
      setError('OAuth state mismatch. Please try again.');
      return;
    }

    // Clean up stored state
    sessionStorage.removeItem('flowstack:oauth_state');

    // Exchange code for session token
    const redirectUri = `${window.location.origin}/api/auth/google/callback`;

    googleLogin(code, redirectUri, {
      baseUrl: config.baseUrl,
      tenantId: config.tenantId,
    })
      .then((response) => {
        if (response.ok && response.data) {
          const { session_token, user_id, tenant_id } = response.data;

          setCredentials({
            apiKey: session_token,
            tenantId: tenant_id || config.tenantId,
            userId: user_id,
          });

          navigate('/workspace', { replace: true });
        } else {
          setError(response.error || 'Google login failed. Please try again.');
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Google login failed.');
      });
  }, [searchParams, config, setCredentials, navigate]);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '1rem',
        background: 'var(--color-bg, #0a0a0a)',
        color: 'var(--color-text, #fff)',
      }}>
        <p style={{ color: 'var(--color-danger, #ef4444)' }}>{error}</p>
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '0.5rem 1.5rem',
            background: 'var(--color-accent, #d4a853)',
            color: '#000',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--color-bg, #0a0a0a)',
      color: 'var(--color-text, #fff)',
    }}>
      <span className="w-6 h-6 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] spin" />
      <span style={{ marginLeft: '0.75rem' }}>Signing in with Google...</span>
    </div>
  );
}
