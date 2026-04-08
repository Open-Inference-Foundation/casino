export default function ContractsSection() {
  const contracts = [
    {
      label: 'INFER Token',
      address: '0xD31f...E1',
      href: 'https://arbiscan.io/address/0xD31fE1',
    },
    {
      label: 'AGENT Token',
      address: '0x41b2...44',
      href: 'https://arbiscan.io/address/0x41b244',
    },
    {
      label: 'InferStaking',
      address: '0x5c55...63',
      href: 'https://arbiscan.io/address/0x5c5563',
    },
    {
      label: 'AgentPurchase',
      address: '0xebA9...07',
      href: 'https://arbiscan.io/address/0xebA907',
    },
    {
      label: 'AgentPayment',
      address: '0xcB6d...2D',
      href: 'https://arbiscan.io/address/0xcB6d2D',
    },
    {
      label: 'SurplusDistribution',
      address: '0xE997...47',
      href: 'https://arbiscan.io/address/0xE99747',
    },
    {
      label: 'Safe (owner)',
      address: '0x7D0C...c0',
      href: 'https://arbiscan.io/address/0x7D0Cc0',
    },
  ];

  return (
    <section className="px-6 py-16 sm:py-24 max-w-5xl mx-auto">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-3 text-center">
        Verified Contracts
      </h2>
      <p className="text-[var(--color-text-secondary)] text-center mb-10 max-w-xl mx-auto">
        All contracts verified on Arbitrum One. Governed by the Open Inference
        Foundation via a 2-of-3 multi-sig Safe.
      </p>

      <div className="max-w-2xl mx-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        {contracts.map((c, i) => (
          <div
            key={c.label}
            className={`flex items-center justify-between px-4 sm:px-6 py-3.5 ${
              i < contracts.length - 1
                ? 'border-b border-[var(--color-border)]'
                : ''
            }`}
          >
            <span className="text-sm font-medium text-[var(--color-text)]">
              {c.label}
            </span>
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-mono text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              {c.address}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
