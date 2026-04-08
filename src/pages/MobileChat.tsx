import { useCallback, useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAgent, useAuth } from '@flowstack/sdk';
import { useAutoScroll } from '@/lib/hooks/useAutoScroll';
import { type AttachmentFile } from '@/components/workspace/ChatInput';
import ChatMessage from '@/components/workspace/ChatMessage';
import MobileChatInput from '@/components/chat/MobileChatInput';
import ThinkingIndicator from '@/components/chat/ThinkingIndicator';
import ThemeToggle from '@/components/ThemeToggle';
import { SEO } from '../components/SEO';

const EXAMPLE_PROMPTS = [
  'Analyze my sales data',
  'Build me a chart from a CSV',
  'What can you help me with?',
];

export default function MobileChat() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { query, messages, isStreaming, cancelQuery, error: agentError } = useAgent(
    'data-science',
    { mode: 'chat' as const },
  );

  const { scrollRef, bottomRef, scrollToBottom } = useAutoScroll({
    messageCount: messages.length,
    isStreaming,
  });

  // Close overflow menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleSend = useCallback(
    async (text: string, attachments: AttachmentFile[]) => {
      scrollToBottom();
      const payload = attachments.length > 0
        ? attachments.map((a) => ({
            filename: a.filename,
            content_type: a.contentType,
            data: a.data,
          }))
        : undefined;
      await query(text, payload);
    },
    [query, scrollToBottom],
  );

  const handleExampleClick = useCallback(
    (prompt: string) => {
      handleSend(prompt, []);
    },
    [handleSend],
  );

  const handleLogout = useCallback(() => {
    logout();
    setMenuOpen(false);
    navigate('/');
  }, [logout, navigate]);

  // Determine if the last assistant message is still empty (show thinking indicator)
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const showThinking = isStreaming && lastMessage?.role === 'assistant' && !lastMessage.content;

  // Inline error message for auth/credit issues
  const errorMessage = agentError
    ? /not authenticated|401|unauthorized/i.test(agentError)
      ? 'auth'
      : /402|daily.*limit|free credit|credit.*limit/i.test(agentError)
      ? 'credits'
      : 'generic'
    : null;

  return (
    <>
      <SEO
        title="Chat"
        description="Chat with Ca$ino — upload files, analyze data, get answers instantly."
        canonicalUrl="/chat"
      />

      <div className="mobile-chat-layout">
        {/* Header */}
        <header className="mobile-chat-header">
          <Link
            to="/"
            className="text-base font-bold text-[var(--color-text)] tracking-tight hover:text-[var(--color-accent)] transition-colors font-display"
          >
            Ca<span className="text-[var(--color-accent)]">$</span>ino
          </Link>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            {isAuthenticated && (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface-alt)] transition-colors"
                  aria-label="Menu"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="3.5" r="1.2" fill="currentColor" />
                    <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                    <circle cx="8" cy="12.5" r="1.2" fill="currentColor" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-10 w-44 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg py-1 z-50">
                    <button
                      onClick={() => { navigate('/workspace'); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] active:bg-[var(--color-surface-alt)] transition-colors"
                    >
                      Workspace
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-[var(--color-error)] hover:bg-[var(--color-surface-alt)] active:bg-[var(--color-surface-alt)] transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className={`mobile-chat-messages pt-5 pb-4 ${messages.length === 0 && !isStreaming ? 'flex flex-col' : ''}`}>
          {messages.length === 0 && !isStreaming ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center text-center px-6 my-auto">
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-lg font-bold mb-4">
                C
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">
                What would you like to know?
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                Upload a file, ask a question, or try an example below.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleExampleClick(prompt)}
                    disabled={!isAuthenticated}
                    className="text-sm px-4 py-2.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] active:bg-[var(--color-surface-alt)] transition-colors disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              {!isAuthenticated && (
                <p className="text-xs text-[var(--color-text-tertiary)] mt-4">
                  <Link to="/login" className="text-[var(--color-accent)] hover:underline">Sign in</Link> to start chatting
                </p>
              )}
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                // Skip the last assistant message if it's empty + streaming —
                // ThinkingIndicator replaces it with cleaner dots-only UX.
                if (showThinking && idx === messages.length - 1) return null;
                return <ChatMessage key={msg.id} message={msg} />;
              })}

              {showThinking && <ThinkingIndicator />}

              {/* Inline error messages */}
              {errorMessage === 'auth' && (
                <div className="flex w-full justify-start mb-4">
                  <div className="rounded-2xl rounded-tl-sm bg-[var(--color-warning-light)] text-[var(--color-text)] px-4 py-3 text-sm">
                    <Link to="/login" className="text-[var(--color-accent)] font-medium hover:underline">Sign in</Link> to continue chatting.
                  </div>
                </div>
              )}
              {errorMessage === 'credits' && (
                <div className="flex w-full justify-start mb-4">
                  <div className="rounded-2xl rounded-tl-sm bg-[var(--color-warning-light)] text-[var(--color-text)] px-4 py-3 text-sm">
                    You've used your free queries for today. <Link to="/workspace" className="text-[var(--color-accent)] font-medium hover:underline">Get more</Link>.
                  </div>
                </div>
              )}
              {errorMessage === 'generic' && (
                <div className="flex w-full justify-start mb-4">
                  <div className="rounded-2xl rounded-tl-sm bg-[var(--color-error-light)] text-[var(--color-text)] px-4 py-3 text-sm">
                    Something went wrong. Please try again.
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <MobileChatInput
          onSend={handleSend}
          isStreaming={isStreaming}
          onCancel={cancelQuery}
          disabled={!isAuthenticated}
        />
      </div>
    </>
  );
}
