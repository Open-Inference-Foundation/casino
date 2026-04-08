import { Link, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[var(--color-bg)]">
      <Link to="/" className="mb-10">
        <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Ca<span style={{ color: 'var(--color-accent)', textShadow: '0 0 12px var(--color-accent)' }}>$</span>ino
        </span>
      </Link>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
