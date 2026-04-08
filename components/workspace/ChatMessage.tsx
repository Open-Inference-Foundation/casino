'use client';

import { type ChatMessage as SDKChatMessage } from '@flowstack/sdk';

interface ChatMessageProps {
  message: SDKChatMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-[var(--color-accent)] flex-shrink-0 mt-0.5 mr-2 flex items-center justify-center text-white text-[10px] font-bold">
          C
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-[var(--color-accent)] text-white rounded-tr-sm'
            : 'bg-[var(--color-surface-alt)] text-[var(--color-text)] rounded-tl-sm'
        } ${message.isStreaming ? 'streaming-cursor' : ''}`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>

        {/* Tool calls summary — deduplicated by name */}
        {message.toolCalls && message.toolCalls.length > 0 && (() => {
          // Collapse repeated tool calls into one badge with a count
          const grouped = new Map<string, { count: number; status: string }>();
          for (const tc of message.toolCalls) {
            const existing = grouped.get(tc.name);
            if (existing) {
              existing.count++;
              // Keep the most "advanced" status: running > complete > error
              if (tc.status === 'running') existing.status = 'running';
              else if (tc.status === 'complete' && existing.status !== 'running') existing.status = 'complete';
            } else {
              grouped.set(tc.name, { count: 1, status: tc.status ?? 'running' });
            }
          }
          return (
            <div className="mt-2 flex flex-wrap gap-1">
              {Array.from(grouped.entries()).map(([name, { count, status }]) => (
                <span
                  key={name}
                  className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    status === 'running'
                      ? 'bg-[var(--color-warning-light)] text-[var(--color-warning)]'
                      : status === 'error'
                      ? 'bg-[var(--color-error-light)] text-[var(--color-error)]'
                      : 'bg-[var(--color-success-light)] text-[var(--color-success)]'
                  }`}
                >
                  {status === 'running' && (
                    <span className="w-2 h-2 rounded-full border border-current border-t-transparent spin" />
                  )}
                  {name}
                </span>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
