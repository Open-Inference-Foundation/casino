interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  return (
    <span
      className={`inline-block rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] spin ${sizes[size]} ${className}`}
    />
  );
}
