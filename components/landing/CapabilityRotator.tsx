import { useState, useEffect, useCallback } from 'react';
import { CapabilityExample } from '@/lib/capability-examples';

interface CapabilityRotatorProps {
  examples: CapabilityExample[];
  onExampleClick: (prompt: string) => void;
}

export default function CapabilityRotator({ examples, onExampleClick }: CapabilityRotatorProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (paused || examples.length <= 1) return;
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % examples.length);
        setTransitioning(false);
      }, 200);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, examples.length]);

  // Reset index when examples list changes (category filter)
  useEffect(() => {
    setIndex(0);
  }, [examples]);

  const current = examples[index];
  if (!current) return null;

  const handleClick = useCallback(() => {
    onExampleClick(current.prompt);
  }, [current.prompt, onExampleClick]);

  return (
    <div
      className="w-full max-w-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Mock input box showing the rotating prompt */}
      <button
        onClick={handleClick}
        className="w-full text-left rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 cursor-pointer hover:border-[var(--color-accent)] transition-all group"
      >
        <div className="flex items-start gap-3">
          <span className="text-[var(--color-text-tertiary)] mt-0.5 flex-shrink-0 text-sm">&gt;</span>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm sm:text-base text-[var(--color-text)] leading-relaxed transition-all duration-200 ${
                transitioning ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
              }`}
            >
              &ldquo;{current.prompt}&rdquo;
            </p>
            <p
              className={`text-xs text-[var(--color-text-tertiary)] mt-2 transition-all duration-200 ${
                transitioning ? 'opacity-0' : 'opacity-100'
              }`}
            >
              &rarr; {current.outcome}
            </p>
          </div>
          <span className="text-xs text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1 whitespace-nowrap">
            Try this
          </span>
        </div>
      </button>

      {/* Dots indicator */}
      {examples.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {examples.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setTransitioning(true);
                setTimeout(() => {
                  setIndex(i);
                  setTransitioning(false);
                }, 200);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === index
                  ? 'bg-[var(--color-accent)] w-4'
                  : 'bg-[var(--color-text-tertiary)] opacity-30 hover:opacity-60'
              }`}
              aria-label={`Example ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
