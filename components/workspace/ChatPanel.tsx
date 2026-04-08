'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { type ChatMessage as SDKChatMessage } from '@flowstack/sdk';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import DomainPicker from './DomainPicker';

interface ChatPanelProps {
  messages: SDKChatMessage[];
  isStreaming: boolean;
  onSend: (text: string) => void;
  onCancel: () => void;
  showDomainPicker: boolean;
  appName?: string | null;
  isEditing?: boolean;
}

export default function ChatPanel({
  messages,
  isStreaming,
  onSend,
  onCancel,
  showDomainPicker,
  appName,
  isEditing,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isStreaming]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    onSend(text);
  }, [input, onSend]);

  const handleDomainSelect = useCallback(
    (prompt: string) => {
      setInput(prompt);
    },
    [],
  );

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)]">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text)]">
            {isEditing ? `Editing: ${appName}` : appName ?? 'New App'}
          </span>
          {isEditing && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-accent-light)] text-[var(--color-accent)] font-medium">
              edit mode
            </span>
          )}
        </div>
      </div>

      {/* Messages or domain picker */}
      {showDomainPicker && messages.length === 0 ? (
        <DomainPicker onSelect={handleDomainSelect} />
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto panel-scroll px-4 py-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onCancel={onCancel}
        isStreaming={isStreaming}
        placeholder={
          isEditing
            ? 'Describe what you want to change...'
            : 'Describe the app you want to build...'
        }
      />
    </div>
  );
}
