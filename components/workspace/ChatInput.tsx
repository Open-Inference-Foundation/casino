'use client';

import { useRef, useCallback, KeyboardEvent } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onCancel: () => void;
  isStreaming: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onCancel,
  isStreaming,
  placeholder = 'Describe the app you want to build...',
  disabled,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isStreaming && value.trim()) onSend();
      }
    },
    [isStreaming, value, onSend],
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
      // Auto-resize
      const ta = textareaRef.current;
      if (ta) {
        ta.style.height = 'auto';
        ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
      }
    },
    [onChange],
  );

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="flex items-end gap-2 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] hover:border-[var(--color-border-hover)] focus-within:border-[var(--color-accent)] transition-colors px-3 py-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isStreaming}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none leading-relaxed"
          style={{ minHeight: '24px', maxHeight: '160px' }}
        />

        {isStreaming ? (
          <button
            onClick={onCancel}
            title="Stop"
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--color-error)] text-white hover:opacity-90 transition-opacity"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="1" width="8" height="8" rx="1.5" fill="currentColor" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={!value.trim() || disabled}
            title="Send (Enter)"
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--color-accent)] text-white disabled:opacity-40 hover:bg-[var(--color-accent-hover)] disabled:hover:bg-[var(--color-accent)] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 11L11 1M11 1H4M11 1V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-1.5 text-[10px] text-[var(--color-text-tertiary)] text-right">
        Enter to send · Shift+Enter for newline
      </p>
    </div>
  );
}
