'use client';

import { useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DOMAIN_TEMPLATES } from '@/lib/domains';

const EXAMPLE_PROMPTS = [
  'A finance app where my users upload bank statements and an AI categorizes their spending',
  'A CRM where my team logs contacts and an AI drafts follow-up emails from their history',
  'A health tracker where each user logs workouts and gets a personalized AI weekly summary',
  'An inventory manager where staff track stock and an AI flags reorder needs automatically',
  'A legal tool where clients upload contracts and an AI extracts key clauses and risk flags',
  'A project tracker where each team has their own tasks and an AI writes status reports',
];

export default function LandingPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [exampleIdx, setExampleIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rotate examples every 4s
  useEffect(() => {
    const id = setInterval(() => setExampleIdx((i) => (i + 1) % EXAMPLE_PROMPTS.length), 4000);
    return () => clearInterval(id);
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    sessionStorage.setItem('casino_pending_prompt', text);
    router.push('/register');
  }, [input, router]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }
  }, []);

  return (
    <div className="landing-full">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <span className="text-base font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Ca<span style={{ color: 'var(--color-accent)', textShadow: '0 0 10px var(--color-accent)' }}>$</span>ino
        </span>
        <Link
          href="/login"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">

        {/* Heading */}
        <p className="text-xs font-mono tracking-[0.2em] uppercase text-[var(--color-accent)] mb-5 opacity-80">
          Not a mockup. Not a chatbot.
        </p>
        <h1 className="text-5xl sm:text-6xl font-bold text-[var(--color-text)] text-center tracking-tight mb-4 leading-tight">
          Build apps people<br />actually sign up for.
        </h1>
        <p className="text-[var(--color-text-secondary)] text-center mb-10 text-base max-w-md">
          Describe your app. Ca$ino ships it with real user auth,
          isolated databases, and an AI agent that works for each of them.
        </p>

        {/* Main input — the CTA */}
        <div
          className="w-full max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] input-glow transition-all"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Describe your app — Ca$ino ships it with auth, data, and an AI agent..."
            rows={2}
            className="w-full px-5 pt-4 pb-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] bg-transparent resize-none focus:outline-none leading-relaxed"
            style={{ minHeight: '56px', maxHeight: '160px' }}
          />
          <div className="flex items-center justify-between px-5 pb-4 pt-1">
            <span className="text-xs text-[var(--color-text-tertiary)]">
              Enter to send
            </span>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-accent)] text-[#080808] font-bold disabled:opacity-25 hover:bg-[var(--color-accent-hover)] disabled:hover:bg-[var(--color-accent)] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 13L13 1M13 1H5M13 1V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Three truths */}
        <div className="flex items-center gap-6 mt-6 mb-2">
          {[
            { icon: '🔐', label: 'Real user auth' },
            { icon: '🗄️', label: 'Isolated DB per user' },
            { icon: '🤖', label: 'Live AI agent' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2.5 mt-6 flex-wrap justify-center">
          {DOMAIN_TEMPLATES.map((d) => (
            <button
              key={d.id}
              onClick={() => setInput(d.examplePrompt)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-all"
            >
              <span className="text-base leading-none">{d.icon}</span>
              <span className="font-medium">{d.name}</span>
            </button>
          ))}
        </div>

        {/* Example prompts */}
        <div className="flex items-center gap-3 mt-5 max-w-2xl w-full">
          <button
            onClick={() => setExampleIdx((i) => (i + 1) % EXAMPLE_PROMPTS.length)}
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors flex-shrink-0"
          >
            Try an example
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1.5 5.5a4 4 0 004 4 4 4 0 003.1-1.6M9.5 5.5a4 4 0 00-4-4 4 4 0 00-3.1 1.6M9.5 2v2H7.5M1.5 9V7H3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => setInput(EXAMPLE_PROMPTS[exampleIdx])}
            className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-all truncate"
          >
            {EXAMPLE_PROMPTS[exampleIdx]}
          </button>
        </div>

      </div>
    </div>
  );
}
