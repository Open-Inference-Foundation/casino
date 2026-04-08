'use client';

import { useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react';
import { DOMAIN_TEMPLATES } from '@/lib/domains';
import { AppEntry } from './AppSidebar';

const EXAMPLE_PROMPTS = [
  'A finance app where my users upload bank statements and an AI categorizes their spending',
  'A CRM where my team logs contacts and an AI drafts follow-up emails from their history',
  'A health tracker where each user logs workouts and gets a personalized AI weekly summary',
  'An inventory manager where staff track stock and an AI flags reorder needs automatically',
  'A legal tool where clients upload contracts and an AI extracts key clauses and risk flags',
  'A project tracker where each team has their own tasks and an AI writes status reports',
];

interface HomeViewProps {
  userEmail?: string;
  recentApps: AppEntry[];
  onSend: (text: string) => void;
  onSelectApp: (app: AppEntry) => void;
  onDeleteApp: (id: string) => void;
  onEditApp: (app: AppEntry) => void;
  onLogout: () => void;
  onViewWorkspace?: () => void;
}

export default function HomeView({
  userEmail,
  recentApps,
  onSend,
  onSelectApp,
  onDeleteApp,
  onEditApp,
  onLogout,
  onViewWorkspace,
}: HomeViewProps) {
  const [input, setInput] = useState('');
  const [exampleIdx, setExampleIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rotate example prompts every 4s
  useEffect(() => {
    const id = setInterval(() => setExampleIdx((i) => (i + 1) % EXAMPLE_PROMPTS.length), 4000);
    return () => clearInterval(id);
  }, []);

  // Pick up pending prompt from landing page
  useEffect(() => {
    const pending = sessionStorage.getItem('casino_pending_prompt');
    if (pending) {
      sessionStorage.removeItem('casino_pending_prompt');
      setInput(pending);
      // Give React a tick to render the textarea before focusing
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, []);

  const firstName = (userEmail?.split('@')[0]) || 'there';

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    onSend(text);
  }, [input, onSend]);

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

  const hasApps = recentApps.length > 0;

  return (
    <div className="h-full flex flex-col overflow-y-auto panel-scroll">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <span className="text-base font-bold text-[var(--color-text)] tracking-tight">
          Ca<span className="text-[var(--color-accent)]">$</span>ino
        </span>

        {/* User menu */}
        <div className="relative flex items-center gap-3">
          {onViewWorkspace && (
            <button
              onClick={onViewWorkspace}
              className="text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              My Apps &rarr;
            </button>
          )}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors text-sm"
          >
            <span className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-[#080808] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {firstName[0].toUpperCase()}
            </span>
            <span className="text-[var(--color-text)] font-medium">{firstName}&apos;s Workspace</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[var(--color-text-tertiary)]">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-10 z-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl py-1 min-w-[180px]"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-secondary)] truncate">{userEmail}</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)]"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main centered content */}
      <div className={`flex flex-col items-center px-6 ${hasApps ? 'pt-8 pb-6' : 'flex-1 justify-center pb-20'}`}>
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text)] text-center tracking-tight mb-2 leading-tight">
          What are you shipping, {firstName}?
        </h1>
        <p className="text-[var(--color-text-secondary)] text-center mb-8 text-sm max-w-sm">
          Describe your app. Ca$ino handles auth, databases, and the AI agent.
        </p>

        {/* Input */}
        <div className="w-full max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] input-glow transition-all">
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
            <span className="text-xs text-[var(--color-text-tertiary)]">Enter to send · Shift+Enter for newline</span>
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

        {/* Category pills */}
        <div className="flex items-center gap-2.5 mt-5 flex-wrap justify-center">
          {DOMAIN_TEMPLATES.map((d) => (
            <button
              key={d.id}
              onClick={() => setInput(d.examplePrompt)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-all"
            >
              <span className="leading-none">{d.icon}</span>
              <span className="font-medium">{d.name}</span>
            </button>
          ))}
        </div>

        {/* Example prompts */}
        <div className="flex items-center gap-3 mt-4 max-w-2xl w-full">
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
            className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-all truncate max-w-xs"
          >
            {EXAMPLE_PROMPTS[exampleIdx]}
          </button>
        </div>
      </div>

      {/* Recent apps */}
      {hasApps && (
        <div className="px-6 pb-10 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">Recent apps</h2>
            <button
              onClick={onViewWorkspace}
              className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium transition-colors"
            >
              View all &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {recentApps.slice(0, 8).map((app) => (
              <div
                key={app.id}
                className="group relative bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-border-hover)] transition-all cursor-pointer"
                onClick={() => onSelectApp(app)}
              >
                <div className="h-24 bg-gradient-to-br from-[var(--color-accent-light)] to-[var(--color-surface-alt)] flex items-center justify-center">
                  <span className="text-2xl opacity-50">{app.url ? '🌐' : '⚡'}</span>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-[var(--color-text)] truncate">{app.name}</p>
                  {app.url && (
                    <p className="text-xs text-[var(--color-text-tertiary)] truncate mt-0.5 font-mono">{app.url}</p>
                  )}
                </div>
                {/* Hover actions */}
                <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
                  {app.url && (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-6 h-6 rounded bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 9L9 1M9 1H4M9 1V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditApp(app); }}
                    className="w-6 h-6 rounded bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M7 1l2 2-6 6H1V7L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${app.name}"?`)) onDeleteApp(app.id); }}
                    className="w-6 h-6 rounded bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-error)] hover:bg-[var(--color-error-light)]"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
