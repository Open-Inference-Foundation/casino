'use client';

import { useState, useEffect } from 'react';

export interface WalletBrowserInfo {
  isWalletBrowser: boolean;
  walletName: 'metamask' | 'coinbase' | 'rainbow' | 'trust' | 'unknown' | null;
  hasInjectedProvider: boolean;
  isMobile: boolean;
}

/**
 * Detect if the user is browsing inside a wallet dApp browser
 * (MetaMask Mobile, Coinbase Wallet, Rainbow, Trust Wallet, etc.).
 *
 * Used to adapt UX: skip WalletConnect, offer one-tap connect, adjust safe areas.
 */
export function useWalletBrowser(): WalletBrowserInfo {
  const [info, setInfo] = useState<WalletBrowserInfo>({
    isWalletBrowser: false,
    walletName: null,
    hasInjectedProvider: false,
    isMobile: false,
  });

  useEffect(() => {
    const result = detectWalletBrowser();
    setInfo(result);
  }, []);

  return info;
}

/**
 * Plain function for module-scope detection (no hooks).
 * Used in ClientProviders.tsx for wagmi config at module init time.
 */
export function detectWalletBrowser(): WalletBrowserInfo {
  if (typeof window === 'undefined') {
    return { isWalletBrowser: false, walletName: null, hasInjectedProvider: false, isMobile: false };
  }

  const ua = navigator.userAgent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eth = (window as any).ethereum;
  const hasProvider = !!eth;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

  let walletName: WalletBrowserInfo['walletName'] = null;
  let isWalletBrowser = false;

  if (eth) {
    if (eth.isMetaMask && isMobile) {
      walletName = 'metamask';
      isWalletBrowser = true;
    } else if (eth.isCoinbaseWallet || ua.includes('CoinbaseBrowser')) {
      walletName = 'coinbase';
      isWalletBrowser = true;
    } else if (ua.includes('Rainbow')) {
      walletName = 'rainbow';
      isWalletBrowser = true;
    } else if (eth.isTrust || ua.includes('Trust')) {
      walletName = 'trust';
      isWalletBrowser = true;
    } else if (hasProvider && isMobile) {
      // Has injected provider on mobile — treat as wallet browser (generic)
      walletName = 'unknown';
      isWalletBrowser = true;
    }
  }

  return { isWalletBrowser, walletName, hasInjectedProvider: hasProvider, isMobile };
}
