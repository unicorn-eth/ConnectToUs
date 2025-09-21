
// Coded Lovingly by @cryptowampum and Claude AI
// App.jsx - Universal wallet support with ALL providers + Unicorn AutoConnect
import React, { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { ThirdwebProvider } from 'thirdweb/react';
import '@rainbow-me/rainbowkit/styles.css';

// Import configurations
import { wagmiConfig, chains } from './config/wagmi.js';

// Import components  
import UnicornAutoConnect from './components/UnicornAutoConnect.jsx';
import TransactionDemo from './components/TransactionDemo.jsx';
import WalletInfo from './components/WalletInfo.jsx';

// Import hooks
import { useUnicornDetection } from './hooks/useUnicornDetection.js';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  const { isUnicornEnvironment, detectionComplete } = useUnicornDetection();
  const [connectionStatus, setConnectionStatus] = useState('detecting');

  useEffect(() => {
    if (detectionComplete) {
      setConnectionStatus(isUnicornEnvironment ? 'unicorn' : 'standard');
    }
  }, [detectionComplete, isUnicornEnvironment]);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo">🦄</span>
            <div>
              <h1>Universal Wallet dApp</h1>
              <p className="subtitle">Works with ALL wallets + Unicorn AutoConnect</p>
            </div>
          </div>
          
          {/* RainbowKit Connect Button - Shows ALL wallet options */}
          <ConnectButton 
            label="Connect Wallet"
            showBalance={true}
            chainStatus="icon"
            accountStatus="avatar"
          />
        </div>

        {/* Connection mode indicator */}
        {connectionStatus !== 'detecting' && (
          <div className="connection-mode">
            <span className="mode-indicator">
              Mode: {connectionStatus === 'unicorn' ? '🦄 Unicorn Auto' : '🔗 Standard'}
            </span>
          </div>
        )}
      </header>

      <main className="app-main">
        {/* Silent Unicorn AutoConnect - doesn't interfere with other wallets */}
        {isUnicornEnvironment && detectionComplete && (
          <UnicornAutoConnect />
        )}

        <div className="content-grid">
          <WalletInfo />
          <TransactionDemo />
        </div>

        <div className="features-section">
          <h2>Universal Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🔄</span>
              <h3>Auto-Connect</h3>
              <p>Seamless Unicorn wallet connection when accessed via App Center</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🌍</span>
              <h3>Universal Support</h3>
              <p>Works with MetaMask, WalletConnect, Coinbase, Rainbow, and more</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <h3>Gasless</h3>
              <p>Sponsored transactions for Unicorn wallet users</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔐</span>
              <h3>Secure</h3>
              <p>Transaction approval system with simulation</p>
            </div>
          </div>
        </div>

        <div className="wallet-support-section">
          <h3>Supported Wallets</h3>
          <div className="wallet-grid">
            <div className="wallet-item unicorn">
              <span>🦄</span>
              <span>Unicorn</span>
              <span className="badge">Auto</span>
            </div>
            <div className="wallet-item">
              <span>🦊</span>
              <span>MetaMask</span>
            </div>
            <div className="wallet-item">
              <span>🔗</span>
              <span>WalletConnect</span>
            </div>
            <div className="wallet-item">
              <span>💰</span>
              <span>Coinbase</span>
            </div>
            <div className="wallet-item">
              <span>🌈</span>
              <span>Rainbow</span>
            </div>
            <div className="wallet-item">
              <span>🛡️</span>
              <span>Safe</span>
            </div>
            <div className="wallet-item">
              <span>💎</span>
              <span>Trust</span>
            </div>
            <div className="wallet-item">
              <span>👛</span>
              <span>Others</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          chains={chains}
          modalSize="compact"
          theme={{
            lightMode: true,
            accentColor: '#8b5cf6',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
          }}
        >
          <ThirdwebProvider>
            <AppContent />
          </ThirdwebProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;