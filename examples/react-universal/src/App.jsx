// src/App.jsx - Updated with environment-driven configuration
// Coded lovingly by @cryptowampum and Claude AI

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
import ChainSwitcher from './components/ChainSwitcher';
import WalletDiagnostics from './components/WalletDiagnostics';
import { useUnicornDetection } from './hooks/useUnicornDetection';
import { getDefaultChain, getChainFromUrl, getSupportedChains, config as thirdwebConfig } from './config/thirdweb';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  const isUnicornEnvironment = useUnicornDetection();
  const { unicornAddress, isUnicornConnected } = useUnicorn();
  
  // Get app configuration
  const appName = import.meta.env.VITE_APP_NAME || 'Universal Unicorn dApp';
  const defaultChain = getDefaultChain();
  const currentChain = getChainFromUrl(); // Use URL-detected chain for display
  const supportedChains = getSupportedChains();
  
  return (
    <div className="App">
      <header style={{ 
        padding: '20px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1>🦄 {appName}</h1>
        <p>Unified Wallet Support • Current Chain: {currentChain.name}</p>
        
        {/* Show chain override info if different from default */}
        {currentChain.id !== defaultChain.id && (
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '6px 12px',
            borderRadius: '4px',
            margin: '4px auto',
            maxWidth: '400px',
            fontSize: '12px'
          }}>
            🔄 Chain Override: {currentChain.name} (Default: {defaultChain.name})
          </div>
        )}
        
        {/* Show environment info in debug mode */}
        {thirdwebConfig.enableDebug && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '8px',
            borderRadius: '4px',
            margin: '8px auto',
            maxWidth: '600px',
            fontSize: '12px'
          }}>
            🔧 Debug Mode: Factory {thirdwebConfig.factoryAddress.slice(0, 8)}... | 
            Current: {currentChain.name} ({currentChain.id}) |
            Chains: {supportedChains.map(c => c.name).join(', ')}
          </div>
        )}
        
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
                ✅ Unicorn Wallet Connected on {currentChain.name}
                <div style={{ fontSize: '12px', marginTop: '5px' }}>
                  {unicornAddress?.slice(0, 6)}...{unicornAddress?.slice(-4)}
                </div>
              </>
            ) : (
              `🦄 Unicorn Environment - AutoConnecting to ${currentChain.name}...`
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
        
        {/* Chain Switcher - only shows in debug mode */}
        <ChainSwitcher />
        
        {/* Wallet Diagnostics - only shows in debug mode */}
        <WalletDiagnostics />
        
        <div style={{ 
          background: '#d1fae5', 
          border: '2px solid #10b981',
          padding: '20px', 
          borderRadius: '8px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h2>🎉 Modular Configuration System</h2>
          <p>This dApp now uses environment variables for:</p>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>✅ Thirdweb Client ID: {thirdwebConfig.clientId.slice(0, 8)}...</li>
            <li>✅ Factory Address: {thirdwebConfig.factoryAddress.slice(0, 8)}...</li>
            <li>✅ Default Chain: {defaultChain.name} (Chain ID: {defaultChain.id})</li>
            <li>✅ Current Chain: {currentChain.name} (Chain ID: {currentChain.id})</li>
            <li>✅ AutoConnect: {thirdwebConfig.enableAutoConnect ? 'Enabled' : 'Disabled'}</li>
            <li>✅ Debug Mode: {thirdwebConfig.enableDebug ? 'Enabled' : 'Disabled'}</li>
          </ul>
        </div>
        
        {thirdwebConfig.enableDebug && (
          <div style={{ 
            background: '#fef3c7', 
            border: '1px solid #f59e0b',
            padding: '16px', 
            borderRadius: '8px',
            marginTop: '16px',
            fontSize: '14px'
          }}>
            <h3>🔍 Debug Information</h3>
            <details>
              <summary>Configuration Details</summary>
              <pre style={{ 
                background: 'white', 
                padding: '8px', 
                borderRadius: '4px', 
                marginTop: '8px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {JSON.stringify({
                  thirdweb: {
                    clientId: thirdwebConfig.clientId,
                    factoryAddress: thirdwebConfig.factoryAddress,
                    defaultChain: defaultChain.name,
                    currentChain: currentChain.name,
                    enableAutoConnect: thirdwebConfig.enableAutoConnect,
                  },
                  environment: {
                    mode: import.meta.env.MODE,
                    dev: import.meta.env.DEV,
                    appName: appName,
                  },
                  supportedChains: supportedChains.map(c => ({ name: c.name, id: c.id })),
                }, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </main>

      {/* Unicorn AutoConnect - only render if in Unicorn environment and enabled */}
      {isUnicornEnvironment && thirdwebConfig.enableAutoConnect && <UnicornAutoConnect />}
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