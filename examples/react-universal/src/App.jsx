// Coded lovingly by @cryptowampum and Claude AI
// src/App.jsx - WITH UNICORN CONTEXT
import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { ThirdwebProvider } from 'thirdweb/react';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from './config/wagmi';
import { UnicornProvider, useUnicorn } from './context/UnicornContext';
import WalletInfo from './components/WalletInfo';
import UnicornAutoConnect from './components/UnicornAutoConnect';
import { useUnicornDetection } from './hooks/useUnicornDetection';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  const isUnicornEnvironment = useUnicornDetection();
  const { unicornAddress, isUnicornConnected } = useUnicorn();
  
  return (
    <div className="App">
      <header style={{ 
        padding: '20px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1>🦄 Universal Wallet dApp</h1>
        <p>Unified Wallet Support</p>
        
        {isUnicornEnvironment && (
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '10px',
            borderRadius: '8px',
            margin: '10px auto',
            maxWidth: '500px'
          }}>
            {isUnicornConnected ? (
              <>
                ✅ Unicorn Wallet Connected
                <div style={{ fontSize: '12px', marginTop: '5px' }}>
                  {unicornAddress?.slice(0, 6)}...{unicornAddress?.slice(-4)}
                </div>
              </>
            ) : (
              '🦄 Unicorn Environment - AutoConnecting...'
            )}
          </div>
        )}
        
        <div style={{ 
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <ConnectButton />
        </div>
      </header>

      <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <WalletInfo />
        
        <div style={{ 
          background: '#d1fae5', 
          border: '2px solid #10b981',
          padding: '20px', 
          borderRadius: '8px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h2>🎉 Unified Wallet System</h2>
          <p>This dApp now properly tracks both:</p>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>✅ Wagmi/RainbowKit connections (MetaMask, etc.)</li>
            <li>✅ Thirdweb Unicorn connections (AutoConnect)</li>
            <li>✅ Shows unified wallet info for both</li>
            <li>✅ Maintains separate connection states</li>
          </ul>
        </div>
      </main>

      {/* Unicorn AutoConnect - only render if in Unicorn environment */}
      {isUnicornEnvironment && <UnicornAutoConnect />}
    </div>
  );
}

// Complete App with all providers
function App() {
  return (
    <ThirdwebProvider>
      <UnicornProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <AppContent />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </UnicornProvider>
    </ThirdwebProvider>
  );
}

export default App;