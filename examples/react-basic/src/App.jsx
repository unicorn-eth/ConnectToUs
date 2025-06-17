import React from 'react';
import { ThirdwebProvider } from "thirdweb/react";
import AppHeader from './components/AppHeader';
import UnicornConnect from './components/UnicornConnect';
import WalletInfo from './components/WalletInfo';
import TransactionDemo from './components/TransactionDemo';
import { useUnicornWallet } from './hooks/useUnicornWallet';
import './styles/App.css';
import './styles/components.css';

function AppContent() {
  const { isConnected, isConnecting, connectionError } = useUnicornWallet();

  if (isConnecting) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <span className="unicorn-logo pulse">🦄</span>
        </div>
        <h2>Connecting to Unicorn Wallet</h2>
        <p>Establishing secure connection...</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <AppHeader />

      <main className="app-main">
        {connectionError && (
          <div className="error-banner">
            <div className="error-content">
              <h3>❌ Connection Failed</h3>
              <p>{connectionError}</p>
              <div className="error-actions">
                <button 
                  onClick={() => window.location.reload()}
                  className="retry-btn"
                >
                  Try Again
                </button>
                <a 
                  href="#troubleshooting" 
                  className="help-link"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Show troubleshooting guide");
                  }}
                >
                  Need Help?
                </a>
              </div>
            </div>
          </div>
        )}

        {isConnected ? (
          <div className="connected-state">
            <div className="cards-grid">
              <WalletInfo />
              <TransactionDemo />
            </div>
            
            <div className="integration-info">
              <h3>🎉 Integration Successful!</h3>
              <p>
                Your dApp is now successfully connected to Unicorn.eth wallets. 
                Users can interact with your application using gasless transactions.
              </p>
              
              <div className="next-steps">
                <h4>Next Steps:</h4>
                <ul>
                  <li>Customize the UI to match your brand</li>
                  <li>Add your contract interactions</li>
                  <li>Submit for App Center approval</li>
                  <li>Deploy to production</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="disconnected-state">
            <div className="welcome-content">
              <h2>Welcome to Unicorn dApp</h2>
              <p>
                This example demonstrates seamless integration with Unicorn.eth smart account wallets.
              </p>
              
              <div className="features-grid">
                <div className="feature-card">
                  <span className="feature-icon">⚡</span>
                  <h4>Instant Connection</h4>
                  <p>No manual wallet selection required</p>
                </div>
                
                <div className="feature-card">
                  <span className="feature-icon">💸</span>
                  <h4>Gasless Transactions</h4>
                  <p>Users never pay gas fees</p>
                </div>
                
                <div className="feature-card">
                  <span className="feature-icon">🔒</span>
                  <h4>Enhanced Security</h4>
                  <p>Only whitelisted dApps can connect</p>
                </div>
              </div>
              
              <div className="connection-help">
                <h4>Connection Requirements:</h4>
                <ul>
                  <li>Access this dApp through a Unicorn App Center</li>
                  <li>Ensure your browser allows necessary permissions</li>
                  <li>Verify this dApp is whitelisted in your community</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Hidden AutoConnect component */}
      <UnicornConnect />
    </div>
  );
}

function App() {
  return (
    <ThirdwebProvider>
      <AppContent />
    </ThirdwebProvider>
  );
}

export default App;