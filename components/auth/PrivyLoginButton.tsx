import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletAuth } from '@flowstack/sdk/wallet';
import Button from '@/components/ui/Button';

interface PrivyLoginButtonProps {
  label?: string;
  className?: string;
}

export default function PrivyLoginButton({ label = 'Sign in', className }: PrivyLoginButtonProps) {
  const navigate = useNavigate();
  const { login, isConnected, isLoading, error } = useWalletAuth();
  const loginAttempted = useRef(false);

  // Navigate when useWalletAuth sets isConnected after backend verify
  useEffect(() => {
    if (isConnected && loginAttempted.current) {
      navigate('/workspace');
    }
  }, [isConnected, navigate]);

  // Fallback: DOM event from useWalletAuth verify success — fires independently
  // of React state propagation which can be disrupted by provider re-renders
  useEffect(() => {
    const handler = () => {
      if (loginAttempted.current) window.location.href = '/workspace';
    };
    window.addEventListener('flowstack:auth-success', handler);
    return () => window.removeEventListener('flowstack:auth-success', handler);
  }, []);

  const handleClick = () => {
    loginAttempted.current = true;
    login('privy');
  };

  return (
    <div className={className}>
      <Button
        type="button"
        loading={isLoading}
        size="lg"
        className="w-full"
        onClick={handleClick}
      >
        {label}
      </Button>
      {error && (
        <p className="text-sm text-[var(--color-error)] bg-[var(--color-error-light)] px-3 py-2 rounded-lg mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
