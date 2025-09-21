// coded lovingly by @cryptowampum and Claude AI
// src/App.jsx - Complete setup for REAL Unicorn session
import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { ThirdwebProvider } from 'thirdweb/react';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from './config/wagmi';
import WalletInfo from './components/WalletInfo';
import UnicornAutoConnect from './components/UnicornAutoConnect';
import { useUnicornDetection } from './hooks/useUnicornDetection';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  const isUnicornEnvironment = useUnicornDetection();
  
  return (
    <div className="App">
      <header style={{ 
        padding: '20px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1>🦄 Universal Wallet dApp</h1>
        <p>Real Session Support</p>
        
        {isUnicornEnvironment && (
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '10px',
            borderRadius: '8px',
            margin: '10px auto',
            maxWidth: '500px'
          }}>
            🦄 Real Unicorn Session Detected - Attempting AutoConnect...
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
        
        {/* Debug button for testing manual connection */}
        {isUnicornEnvironment && (
          <button
            onClick={async () => {
              console.log('Testing manual Unicorn connection...');
              try {
                const { createThirdwebClient } = await import('thirdweb');
                const { inAppWallet } = await import('thirdweb/wallets');
                const { polygon } = await import('thirdweb/chains');
                
                const client = createThirdwebClient({
                  clientId: "4e8c81182c3709ee441e30d776223354"
                });
                
                const wallet = inAppWallet({
                  smartAccount: {
                    chain: polygon,
                    gasless: true,
                    factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
                  }
                });
                
                const urlParams = new URLSearchParams(window.location.search);
                const authCookie = urlParams.get('authCookie');
                
                const account = await wallet.connect({
                  client,
                  // Try different connection strategies
                  ...(authCookie && authCookie !== 'test' ? {
                    strategy: "auth_endpoint",
                    payload: authCookie
                  } : {})
                });
                
                console.log('✅ Manual connection successful!', account);
                alert('Connected! Check console for details.');
              } catch (error) {
                console.error('❌ Manual connection failed:', error);
                alert('Connection failed! Check console for error.');
              }
            }}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Test Manual Unicorn Connection
          </button>
        )}
        
        <div style={{ 
          background: '#f0f9ff', 
          border: '2px solid #0ea5e9',
          padding: '20px', 
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h3>📝 Real Session Testing</h3>
          <ol style={{ textAlign: 'left', lineHeight: '1.8' }}>
            <li>Make sure you're accessing through Unicorn App Center</li>
            <li>Check console (F12) for connection attempts</li>
            <li>Try the manual connection button if AutoConnect fails</li>
            <li>Use RainbowKit button as fallback</li>
          </ol>
        </div>
      </main>

      {/* Unicorn AutoConnect - only render if in Unicorn environment */}
      {isUnicornEnvironment && <UnicornAutoConnect />}
    </div>
  );
}

// IMPORTANT: ThirdwebProvider must be at the top level!
function App() {
  return (
    <ThirdwebProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <AppContent />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThirdwebProvider>
  );
}

export default App;