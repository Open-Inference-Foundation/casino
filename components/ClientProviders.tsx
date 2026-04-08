'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { FlowstackProvider } from '@flowstack/sdk';
import { getFlowstackConfig } from '@/lib/config';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

const wagmiConfig = createConfig({
  chains: [arbitrum],
  connectors: [
    injected(),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      metadata: {
        name: 'Casino Builder',
        description: 'Build AI-powered apps',
        url: 'https://casino.flowstack.fun',
        icons: ['https://casino.flowstack.fun/favicon.ico'],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [arbitrum.id]: http(),
  },
});

// Expose wagmi config for imperative access
if (typeof window !== 'undefined') {
  (window as any).__wagmiConfig = wagmiConfig;
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <FlowstackProvider config={getFlowstackConfig()}>
          {children as any}
        </FlowstackProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
