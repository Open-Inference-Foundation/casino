import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service — Ca$ino' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight mb-12 inline-block"
          style={{ color: 'var(--color-text)' }}
        >
          Ca<span style={{ color: 'var(--color-accent)' }}>$</span>ino
        </Link>

        <h1 className="text-3xl font-semibold text-[var(--color-text)] mt-8 mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-10">Last updated: April 1, 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-[var(--color-text-secondary)] leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Acceptance</h2>
            <p>
              By using Ca$ino, you agree to these terms. If you don't agree, don't use it.
              Ca$ino is a tool for building web applications using AI — use it for that.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">What Ca$ino provides</h2>
            <p>
              Ca$ino gives you an AI agent that generates and publishes web applications based on your instructions.
              Builds are hosted on Flowstack infrastructure. We reserve the right to take down content that
              violates these terms or applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Your account</h2>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>One account per person. Don't share accounts.</li>
              <li>You must be 13 years or older to use Ca$ino.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Acceptable use</h2>
            <p>You agree not to use Ca$ino to:</p>
            <ul className="list-disc list-inside space-y-2 ml-1 mt-2">
              <li>Build applications designed to deceive, defraud, or harm others.</li>
              <li>Generate or distribute illegal content.</li>
              <li>Attempt to circumvent Ca$ino's rate limits or security measures.</li>
              <li>Resell or sublicense access to Ca$ino without permission.</li>
              <li>Build applications that violate third-party terms of service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Ownership</h2>
            <p>
              You own the applications you build with Ca$ino. We don't claim ownership of your output.
              We own Ca$ino itself — the platform, the agent, and the infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Service availability</h2>
            <p>
              Ca$ino is provided as-is. We'll try to keep it running but don't guarantee uptime.
              We may change, suspend, or discontinue features at any time. We're not liable for
              data loss or downtime — back up anything important.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Limitation of liability</h2>
            <p>
              Ca$ino is provided "as is" without warranty of any kind. To the maximum extent permitted
              by law, we're not liable for any indirect, incidental, or consequential damages arising
              from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Changes</h2>
            <p>
              We may update these terms. Continued use of Ca$ino after changes means you accept the new terms.
              Material changes will be communicated via email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Contact</h2>
            <p>
              Questions? Email <a href="mailto:keon.cummings@gmail.com" className="text-[var(--color-accent)] hover:underline">keon.cummings@gmail.com</a>.
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-[var(--color-border)]">
          <Link href="/privacy" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
            ← Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
