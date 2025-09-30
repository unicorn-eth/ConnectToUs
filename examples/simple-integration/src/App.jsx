// Cooded lovingly by @cryptowampum and Claude AI
// src/App.jsx - Clean integration example
// This shows how to add UnicornAutoConnect without breaking existing code

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, polygon, mainnet } from 'wagmi/chains';

// Import components
import UnicornAutoConnect from './components/UnicornAutoConnect';
import ExistingAppContent from './components/ExistingAppContent';

// Your existing wallet configuration (unchanged)
const config = getDefaultConfig({
  appName: 'My Existing dApp',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [base, polygon, mainnet],
  ssr: false,
});

const queryClient = new QueryClient();

// Your existing App component with minimal changes
function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="app">
            <header className="header">
              <h1>🦄 Simple Integration Example</h1>
              <p>Existing dApp + UnicornAutoConnect (Non-Breaking)</p>
            </header>

            {/* Your existing app content */}
            <ExistingAppContent />

            {/* 
              🦄 ADD JUST THIS ONE LINE TO YOUR EXISTING APP
              Everything else stays exactly the same
            */}
            <UnicornAutoConnect
              onConnect={(wallet) => {
                // Extract wallet address properly
                let walletAddress = 'Unknown';
                try {
                  const account = wallet.getAccount?.();
                  walletAddress = account?.address || wallet.address || 'No address found';
                } catch (e) {
                  console.warn('Could not extract wallet address:', e);
                }
                
                console.log('🦄 Unicorn wallet connected! Address:', walletAddress);
                
                // Use custom event to communicate with other components
                window.dispatchEvent(new CustomEvent('unicorn-wallet-connected', {
                  detail: { wallet, address: walletAddress }
                }));
              }}
              onError={(error) => {
                console.log('🦄 AutoConnect failed, but other wallets still work');
              }}
              debug={true} // Enable debug logging for demo
            />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;