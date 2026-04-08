'use client';

import { useState, useCallback, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@flowstack/sdk';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GoogleButton from './GoogleButton';

export default function RegisterForm() {
  const router = useRouter();
  const { register, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError('');
      if (password !== confirm) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      setLoading(true);
      try {
        const ok = await register(email, password);
        if (ok) {
          router.push('/workspace');
        } else {
          // Surface the SDK error — detect 409 "already exists" from the message
          const sdkError = (authError ?? '').toLowerCase();
          if (sdkError.includes('409') || sdkError.includes('already') || sdkError.includes('exist')) {
            setError('An account with this email already exists. Sign in instead.');
          } else {
            setError(authError ?? 'Registration failed. Please try again.');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [email, password, confirm, register, router],
  );

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">Start building</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Real users. Real data. Live in 3 minutes.</p>
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
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <Input
          id="confirm"
          type="password"
          label="Confirm password"
          placeholder="Re-enter your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />

        {error && (
          <p className="text-sm text-[var(--color-error)] bg-[var(--color-error-light)] px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
          Create account
        </Button>

        <div className="relative flex items-center gap-3 my-1">
          <div className="flex-1 border-t border-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text-secondary)]">or</span>
          <div className="flex-1 border-t border-[var(--color-border)]" />
        </div>

        <GoogleButton />
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--color-accent)] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
