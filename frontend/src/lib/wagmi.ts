import { http, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

/**
 * RainbowKit + Wagmi Configuration
 * Used for Ethereum wallet connections and SIWE authentication
 */
export const wagmiConfig = getDefaultConfig({
  appName: 'Better Auth Template',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

export default wagmiConfig;
