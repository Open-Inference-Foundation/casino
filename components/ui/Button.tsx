'use client';

import { ComponentPropsWithoutRef, forwardRef } from 'react';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, children, className = '', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      primary: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]',
      secondary:
        'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] hover:border-[var(--color-border-hover)]',
      ghost: 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]',
      danger: 'bg-[var(--color-error)] text-white hover:opacity-90',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-sm px-5 py-2.5 gap-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full spin" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
