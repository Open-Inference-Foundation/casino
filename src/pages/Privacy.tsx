import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export default function Privacy() {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="How Ca$ino Builder collects, uses, and protects your data. We do not sell your data or train third-party models on your prompts."
        canonicalUrl="/privacy"
      />
      <div className="min-h-screen bg-[var(--color-bg)] px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight mb-12 inline-block"
            style={{ color: 'var(--color-text)' }}
          >
            Ca<span style={{ color: 'var(--color-accent)' }}>$</span>ino
          </Link>

          <main>
            <h1 className="text-3xl font-semibold text-[var(--color-text)] mt-8 mb-2">Privacy Policy</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mb-10">Last updated: April 1, 2026</p>

            <div className="prose prose-invert max-w-none space-y-8 text-[var(--color-text-secondary)] leading-relaxed">

              <section>
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">What Ca$ino is</h2>
                <p>
                  Ca$ino is an AI-powered web application builder. You describe what you want to build,
                  and Ca$ino builds it. This policy explains how we collect and use data when you use Ca$ino.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Information we collect</h2>
                <ul className="list-disc list-inside space-y-2 ml-1">
                  <li><strong className="text-[var(--color-text)]">Account information</strong> — email address, and if you sign in with Google, your Google account name and profile.</li>
                  <li><strong className="text-[var(--color-text)]">Prompts and builds</strong> — the instructions you send to the agent and the applications it generates on your behalf.</li>
                  <li><strong className="text-[var(--color-text)]">Usage data</strong> — standard server logs including IP address, browser type, and pages visited. We use this to keep the service running.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">How we use it</h2>
                <ul className="list-disc list-inside space-y-2 ml-1">
                  <li>To operate Ca$ino and deliver the apps you build.</li>
                  <li>To authenticate you and protect your account.</li>
                  <li>To improve the service — understanding how builders use Ca$ino helps us make it better.</li>
                </ul>
                <p className="mt-3">We do not sell your data. We do not use your prompts to train third-party models without your consent.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Data storage</h2>
                <p>
                  Your account data and build artifacts are stored on AWS infrastructure (S3, DynamoDB) in us-east-1.
                  Builds you publish are served via CloudFront CDN. Session tokens expire after 24 hours.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Third-party services</h2>
                <ul className="list-disc list-inside space-y-2 ml-1">
                  <li><strong className="text-[var(--color-text)]">Google OAuth</strong> — if you sign in with Google, your authentication is handled by Google's OAuth 2.0 service. Google's privacy policy applies to that interaction.</li>
                  <li><strong className="text-[var(--color-text)]">Anthropic / Claude</strong> — prompts are processed by Claude to generate your applications. Anthropic's usage policies apply.</li>
                  <li><strong className="text-[var(--color-text)]">AWS CloudFront</strong> — Ca$ino's frontend is served from AWS S3 + CloudFront.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Your rights</h2>
                <p>
                  You can delete your account at any time by contacting us. Deleting your account removes your
                  personal information and build history. Published apps may remain accessible until manually removed.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Contact</h2>
                <p>
                  Questions? Email <a href="mailto:keon.cummings@gmail.com" className="text-[var(--color-accent)] hover:underline" rel="noopener noreferrer">keon.cummings@gmail.com</a>.
                </p>
              </section>

            </div>

            <div className="mt-16 pt-8 border-t border-[var(--color-border)]">
              <Link to="/terms" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                Terms of Service →
              </Link>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
