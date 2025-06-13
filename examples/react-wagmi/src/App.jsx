import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThirdwebProvider } from "thirdweb/react";
import { wagmiConfig, thirdwebClient } from './config/wagmi';
import ConnectButton from './components/ConnectButton';
import WalletStatus from './components/WalletStatus';
import TransactionDemo from './components/TransactionDemo';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThirdwebProvider>
          <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>🦄 Unicorn Wagmi Example</h1>
            <ConnectButton />
            <br />
            <WalletStatus />
            <br />
            <TransactionDemo />
          </div>
        </ThirdwebProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
