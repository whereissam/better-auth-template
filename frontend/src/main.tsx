import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { wagmiConfig, isWagmiEnabled } from './lib/wagmi';
import App from './App';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  isWagmiEnabled && wagmiConfig ? (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  ) : (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
);
