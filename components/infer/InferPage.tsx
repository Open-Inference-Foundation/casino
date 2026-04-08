import { Link } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import HeroSection from './HeroSection';
import ProblemSection from './ProblemSection';
import TwoTokensSection from './TwoTokensSection';
import LifecycleSection from './LifecycleSection';
import FlywheelSection from './FlywheelSection';
import RevenueSplitSection from './RevenueSplitSection';
import LiveStatsSection from './LiveStatsSection';
import ContractsSection from './ContractsSection';
import CTASection from './CTASection';

export default function InferPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-md">
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-[var(--color-text)]"
        >
          Ca<span className="text-[var(--color-accent)]">$</span>ino
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/register"
            className="text-sm font-semibold px-5 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Sections */}
      <HeroSection />
      <ProblemSection />
      <TwoTokensSection />
      <LifecycleSection />
      <FlywheelSection />
      <RevenueSplitSection />
      <LiveStatsSection />
      <ContractsSection />
      <CTASection />

      {/* Footer */}
      <footer className="flex items-center justify-center gap-6 px-6 py-6 border-t border-[var(--color-border)]">
        <Link
          to="/terms"
          className="text-[10px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors uppercase tracking-[0.15em]"
        >
          Terms
        </Link>
        <Link
          to="/privacy"
          className="text-[10px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors uppercase tracking-[0.15em]"
        >
          Privacy
        </Link>
        <span className="text-[10px] text-[var(--color-text-tertiary)] tracking-[0.15em]">
          The safest casino in the world
        </span>
      </footer>
    </div>
  );
}
