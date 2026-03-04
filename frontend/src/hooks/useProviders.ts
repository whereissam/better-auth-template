import { useState, useEffect } from 'react';

export interface EnabledProviders {
  email: boolean;
  google: boolean;
  twitter: boolean;
  telegram: boolean;
  siwe: boolean;
  passkey: boolean;
}

const defaultProviders: EnabledProviders = {
  email: false,
  google: false,
  twitter: false,
  telegram: false,
  siwe: false,
  passkey: false,
};

// WalletConnect is the only frontend-side check (needs VITE_WALLETCONNECT_PROJECT_ID)
const hasWalletConnect = !!import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

let cachedProviders: EnabledProviders | null = null;

export function useProviders() {
  const [providers, setProviders] = useState<EnabledProviders>(cachedProviders || defaultProviders);
  const [isLoading, setIsLoading] = useState(!cachedProviders);

  useEffect(() => {
    if (cachedProviders) return;

    fetch('/api/auth/providers', { credentials: 'include' })
      .then((res) => res.json())
      .then((data: EnabledProviders) => {
        // SIWE requires both backend config AND frontend WalletConnect project ID
        data.siwe = data.siwe && hasWalletConnect;
        cachedProviders = data;
        setProviders(data);
      })
      .catch(() => {
        // On error, keep all disabled
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { providers, isLoading };
}
