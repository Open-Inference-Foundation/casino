'use client';

import { useState, useCallback, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@flowstack/sdk';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GoogleButton from './GoogleButton';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Surface OAuth callback errors
  useEffect(() => {
    const authError = searchParams.get('auth_error');
    if (authError) {
      const messages: Record<string, string> = {
        missing_code: 'Google sign-in failed — no authorization code received.',
        backend_error: 'Google sign-in failed — server error. Try email/password.',
        connection_error: 'Could not reach the server. Try again.',
      };
      setError(messages[authError] ?? 'Google sign-in failed. Try email/password.');
    }
  }, [searchParams]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
        const ok = await login(email, password);
        if (ok) {
          router.push('/workspace');
        } else {
          setError('Incorrect email or password.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed. Check your credentials.');
      } finally {
        setLoading(false);
      }
    },
    [email, password, login, router],
  );

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">Welcome back</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Sign in to your Casino account</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {error && (
          <p className="text-sm text-[var(--color-error)] bg-[var(--color-error-light)] px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
          Sign in
        </Button>

        <div className="relative flex items-center gap-3 my-1">
          <div className="flex-1 border-t border-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text-secondary)]">or</span>
          <div className="flex-1 border-t border-[var(--color-border)]" />
        </div>

        <GoogleButton />
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[var(--color-accent)] hover:underline font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}
