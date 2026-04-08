import { useState, useCallback, useRef, useEffect, useMemo, KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWalletBrowser } from '@/lib/hooks/useWalletBrowser';
import ThemeToggle from '@/components/ThemeToggle';
import { SEO } from '../components/SEO';
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from '../lib/seo';
import { getRotationSequence, type CapabilityCategory } from '@/lib/capability-examples';
import CapabilityRotator from '@/components/landing/CapabilityRotator';
import CategoryGrid from '@/components/landing/CategoryGrid';
import WhoCanBuild from '@/components/landing/WhoCanBuild';

export default function Landing() {
  const navigate = useNavigate();
  const { isWalletBrowser, walletName } = useWalletBrowser();
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CapabilityCategory | 'all'>('all');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const rotationExamples = useMemo(
    () => getRotationSequence(selectedCategory),
    [selectedCategory],
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    sessionStorage.setItem('casino_pending_prompt', text);
    navigate(isWalletBrowser ? '/login' : '/register');
  }, [input, navigate, isWalletBrowser]);

  const handleExampleClick = useCallback(
    (prompt: string) => {
      sessionStorage.setItem('casino_pending_prompt', prompt);
      navigate(isWalletBrowser ? '/login' : '/register');
    },
    [navigate, isWalletBrowser],
  );

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
    <>
      <SEO
        title="Ca$ino Builder — Describe an app, get a live URL"
        description="Describe what you need. Get a production app with auth, a database, and an AI agent — deployed in minutes. 60 free credits daily."
        canonicalUrl="/"
        keywords={['AI app builder', 'no code', 'React generator', 'full-stack AI', '$AGENT token']}
        jsonLd={[
          buildOrganizationJsonLd({
            name: 'Ca$ino Builder',
            description:
              'AI-powered application builder. Describe what you need and get a production app with auth, database, and an AI agent in minutes.',
            contactEmail: 'keon.cummings@gmail.com',
          }),
          buildWebSiteJsonLd({
            name: 'Ca$ino Builder',
            description: 'Describe what you need. Get a production app with auth, a database, and an AI agent.',
          }),
        ]}
      />
      <div className="landing-full relative overflow-hidden">
        {/* Subtle texture overlay */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }} />

        {/* Warm ambient glow */}
        <div className="pointer-events-none absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full opacity-8 blur-[140px]" style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full opacity-6 blur-[120px]" style={{ background: 'radial-gradient(circle, var(--color-accent-2) 0%, transparent 70%)' }} />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 flex-shrink-0">
          <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Ca<span style={{ color: 'var(--color-accent)' }}>$</span>ino
          </span>
          <div className="flex items-center gap-3">
            <Link
              to="/chat"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
            >
              Chat
            </Link>
            <ThemeToggle />
            {isWalletBrowser ? (
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="14" rx="2" />
                  <path d="M16 14h.01" />
                  <path d="M2 10h20" />
                </svg>
                Connect {walletName === 'metamask' ? 'MetaMask' : walletName === 'coinbase' ? 'Coinbase' : walletName === 'rainbow' ? 'Rainbow' : walletName === 'trust' ? 'Trust' : 'Wallet'}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold px-5 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-8">
          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-center tracking-tight leading-[1.1] mb-2">
            <span className="text-[var(--color-text)]">Describe what you want to build.</span>
            <br />
            <span style={{ color: 'var(--color-accent)' }}>Ca$ino makes it real.</span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] text-center max-w-lg mb-6 leading-relaxed">
            Type what you need. Get a production app with auth, a database, and an AI agent.
          </p>

          {/* Rotating capability examples */}
          <CapabilityRotator
            examples={rotationExamples}
            onExampleClick={handleExampleClick}
          />

          {/* CTA input */}
          <div className="w-full max-w-2xl rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] input-glow transition-all relative shadow-sm mt-6">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Or describe your own idea..."
              rows={2}
              aria-label="Describe the app you want to build"
              className="w-full px-5 pt-4 pb-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] bg-transparent resize-none focus:outline-none leading-relaxed"
              style={{ minHeight: '56px', maxHeight: '160px' }}
            />
            <div className="flex items-center justify-between px-5 pb-3 pt-1">
              <span className="text-xs text-[var(--color-text-tertiary)]">
                Try it free — no wallet needed
              </span>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-9 px-5 rounded-lg flex items-center gap-2 bg-[var(--color-accent)] text-white text-sm font-semibold disabled:opacity-20 hover:bg-[var(--color-accent-hover)] disabled:hover:bg-[var(--color-accent)] transition-colors"
              >
                Build
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Category grid */}
          <div className="mt-12 w-full">
            <CategoryGrid selected={selectedCategory} onSelect={setSelectedCategory} />
          </div>

          {/* Who can build */}
          <div className="mt-10 w-full">
            <WhoCanBuild />
          </div>

          {/* Stats */}
          <aside className="flex items-center gap-8 sm:gap-12 mt-10" aria-label="Key metrics">
            {[
              { val: '60/day', label: 'free credits' },
              { val: '<2min', label: 'to production' },
              { val: '$AGENT', label: 'per interaction' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="text-base sm:text-lg font-bold font-mono text-[var(--color-accent)]">{val}</p>
                <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-[0.15em] mt-0.5">{label}</p>
              </div>
            ))}
          </aside>
        </main>

        {/* Footer */}
        <footer className="relative z-10 flex items-center justify-center gap-6 px-6 py-4 border-t border-[var(--color-border)]">
          <Link to="/terms" className="text-[10px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors uppercase tracking-[0.15em]">Terms</Link>
          <Link to="/privacy" className="text-[10px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors uppercase tracking-[0.15em]">Privacy</Link>
          <span className="text-[10px] text-[var(--color-text-tertiary)] tracking-[0.15em]">The safest casino in the world</span>
        </footer>
      </div>
    </>
  );
}
