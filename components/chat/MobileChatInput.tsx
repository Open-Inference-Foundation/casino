import { useRef, useCallback, useState, KeyboardEvent } from 'react';
import { useIOSKeyboard } from '@/lib/hooks/useIOSKeyboard';
import { type AttachmentFile, encodeFile } from '@/components/workspace/ChatInput';

const MAX_FILE_MB = 10;
const ACCEPTED = 'image/*,.pdf,.docx,.txt,.csv,.md,.log,.json,.yaml,.yml,.xml,.html';

interface MobileChatInputProps {
  onSend: (text: string, attachments: AttachmentFile[]) => void;
  isStreaming: boolean;
  onCancel: () => void;
  disabled?: boolean;
}

export default function MobileChatInput({ onSend, isStreaming, onCancel, disabled }: MobileChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { keyboardHeight } = useIOSKeyboard();

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text && attachments.length === 0) return;
    const currentAttachments = attachments;
    setInput('');
    setAttachments([]);
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onSend(text, currentAttachments);
  }, [input, attachments, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isStreaming && (input.trim() || attachments.length > 0)) handleSend();
      }
    },
    [isStreaming, input, attachments, handleSend],
  );

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      // 4 lines max (~24px line height * 4 = 96px), then scroll internally
      ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`;
    }
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = '';
      setSizeError(null);

      const oversized = files.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
      if (oversized) {
        setSizeError(`${oversized.name} exceeds ${MAX_FILE_MB}MB limit`);
        return;
      }

      const encoded = await Promise.all(files.map(encodeFile));
      setAttachments((prev) => [...prev, ...encoded]);
    },
    [],
  );

  const removeAttachment = useCallback((idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  return (
    <div
      className="mobile-chat-input-wrapper"
      style={keyboardHeight > 0 ? { paddingBottom: `${keyboardHeight}px` } : undefined}
    >
      {/* Attachment preview strip */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3 pt-2">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-xs text-[var(--color-text-secondary)]"
            >
              {att.preview ? (
                <img src={att.preview} alt={att.filename} className="h-5 w-5 rounded object-cover flex-shrink-0" />
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                  <path d="M2 1h6l2 2v8H2V1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="M7 1v3h3" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              )}
              <span className="max-w-[100px] truncate">{att.filename}</span>
              <button
                onClick={() => removeAttachment(idx)}
                className="text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] ml-0.5 touch-target"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {sizeError && (
        <p className="text-[10px] text-[var(--color-error)] px-3 pt-1">{sizeError}</p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Unified input pill — all controls inside one container */}
      <div className="flex items-end mx-3 my-2 border border-[var(--color-border)] rounded-full bg-[var(--color-surface)] hover:border-[var(--color-border-hover)] focus-within:border-[var(--color-accent)] transition-colors">
        {/* Upload / + button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isStreaming || disabled}
          title="Attach file"
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] active:scale-95 disabled:opacity-40 transition-all ml-1"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 4v10M4 9h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          disabled={disabled || isStreaming}
          rows={1}
          className="flex-1 resize-none bg-transparent text-[16px] text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none leading-relaxed py-2.5"
          style={{ minHeight: '24px', maxHeight: '120px' }}
        />

        {/* Send / Stop button */}
        {isStreaming ? (
          <button
            onClick={onCancel}
            title="Stop"
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--color-text)] text-[var(--color-surface)] hover:opacity-90 active:scale-95 transition-all mr-1 mb-0.5"
          >
            <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1" fill="currentColor" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={(!input.trim() && attachments.length === 0) || disabled}
            title="Send"
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--color-text)] text-[var(--color-surface)] disabled:opacity-20 hover:opacity-80 active:scale-95 transition-all mr-1 mb-0.5"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 12V2M7 2L3 6M7 2l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Keyboard hint — desktop only */}
      <p className="hidden md:block text-[10px] text-[var(--color-text-tertiary)] text-right px-4 pb-1">
        Enter to send · Shift+Enter for newline
      </p>
    </div>
  );
}
