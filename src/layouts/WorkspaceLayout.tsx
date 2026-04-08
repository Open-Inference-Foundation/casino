import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useFlowstackOptional } from '@flowstack/sdk';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const ctx = useFlowstackOptional();
  const navigate = useNavigate();

  // Redirect to login when not authenticated
  useEffect(() => {
    if (ctx?.isInitialized && !ctx.isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [ctx?.isInitialized, ctx?.isAuthenticated, navigate]);

  // Global 401 handler — when any API call returns 401, clear credentials and redirect
  useEffect(() => {
    function handle401(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.status === 401) {
        ctx?.logout?.();
        navigate('/login', { replace: true });
      }
    }
    window.addEventListener('flowstack:auth-error', handle401);
    return () => window.removeEventListener('flowstack:auth-error', handle401);
  }, [ctx, navigate]);

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

function UserMenu() {
  const ctx = useFlowstackOptional();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    ctx?.logout?.();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 9999 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--color-accent, #d4a853)', border: 'none',
          color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}
        title="Account"
      >
        {ctx?.credentials?.email?.[0]?.toUpperCase() || '?'}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 40, right: 0, minWidth: 160,
          background: 'var(--color-surface, #1a1a1a)', border: '1px solid var(--color-border, #333)',
          borderRadius: 8, padding: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--color-text-muted, #888)', borderBottom: '1px solid var(--color-border, #333)' }}>
            {ctx?.credentials?.email || ctx?.credentials?.userId?.slice(0, 16) || 'User'}
          </div>
          <button
            onClick={() => { setOpen(false); navigate('/workspace'); }}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: 'var(--color-text, #fff)', cursor: 'pointer', fontSize: 13 }}
          >
            Workspace
          </button>
          <button
            onClick={handleLogout}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: 'var(--color-danger, #ef4444)', cursor: 'pointer', fontSize: 13 }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function WorkspaceLayout() {
  return (
    <AuthGuard>
      <UserMenu />
      <main>
        <Outlet />
      </main>
    </AuthGuard>
  );
}
