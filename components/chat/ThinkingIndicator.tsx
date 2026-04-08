export default function ThinkingIndicator() {
  return (
    <div className="flex w-full justify-start mb-3">
      <div className="flex items-center gap-1.5 py-2">
        <span className="thinking-dot w-2 h-2 rounded-full bg-[var(--color-text-tertiary)]" style={{ animation: 'thinking-dot 1.4s infinite' }} />
        <span className="thinking-dot w-2 h-2 rounded-full bg-[var(--color-text-tertiary)]" style={{ animation: 'thinking-dot 1.4s infinite', animationDelay: '160ms' }} />
        <span className="thinking-dot w-2 h-2 rounded-full bg-[var(--color-text-tertiary)]" style={{ animation: 'thinking-dot 1.4s infinite', animationDelay: '320ms' }} />
      </div>
    </div>
  );
}
