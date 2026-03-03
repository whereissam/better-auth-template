import { http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export const isWagmiEnabled = !!projectId;

export const wagmiConfig = isWagmiEnabled
  ? getDefaultConfig({
      appName: 'Better Auth Template',
      projectId,
      chains: [mainnet],
      transports: {
        [mainnet.id]: http(),
      },
    })
  : null;

export default wagmiConfig;
