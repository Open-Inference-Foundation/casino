'use client';

import { ComponentPropsWithoutRef, forwardRef } from 'react';

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[var(--color-text)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] bg-[var(--color-surface)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0 focus:border-[var(--color-accent)] ${
            error
              ? 'border-[var(--color-error)]'
              : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
