import { Helmet } from 'react-helmet-async';

/**
 * P0-20 GEO: FAQ component with auto-generated FAQPage JSON-LD.
 *
 * LLMs love FAQ content because it maps directly to question→answer pairs.
 * Rendering Q&A in an <dl>/<dt>/<dd> structure + injecting FAQPage JSON-LD
 * makes the content both visually coherent for humans AND maximally
 * extractable for Google's rich snippets + LLM citations.
 *
 * Usage:
 *   <FAQ
 *     items={[
 *       { question: "How much does Casino cost?", answer: "Free tier: 60 credits/day. Paid: from $15 for 160 credits." },
 *       { question: "What can I build?", answer: "CRMs, dashboards, finance trackers, client portals, internal tools — anything." },
 *     ]}
 *   />
 *
 * Phase E extracts this to `@flowstack/sdk`.
 */

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQProps {
  items: FAQItem[];
  /** Optional heading above the FAQ list */
  heading?: string;
  /** Heading level for the h-tag (default h2). Keep sequential with your page. */
  headingLevel?: 2 | 3;
}

export function FAQ({ items, heading, headingLevel = 2 }: FAQProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <section aria-labelledby="faq-heading">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      {heading && (
        <Heading id="faq-heading" className="text-2xl font-semibold mb-6">
          {heading}
        </Heading>
      )}
      <dl>
        {items.map((item, i) => (
          <div key={i} className="mb-6">
            <dt className="text-lg font-semibold text-[var(--color-text)] mb-2">
              {item.question}
            </dt>
            <dd className="text-[var(--color-text-secondary)] leading-relaxed">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
