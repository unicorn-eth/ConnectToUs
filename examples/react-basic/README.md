# React Basic Example

> Complete React project demonstrating Unicorn.eth wallet integration

## Quick Start

```bash
git clone https://github.com/MyUnicornAccount/ConnectToUs.git
cd ConnectToUs/examples/react-basic
npm install
npm run dev
```

## Project Structure

```
react-basic/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── UnicornConnect.jsx
│   │   ├── WalletInfo.jsx
│   │   ├── TransactionDemo.jsx
│   │   └── AppHeader.jsx
│   ├── hooks/
│   │   └── useUnicornWallet.js
│   ├── utils/
│   │   └── unicornConfig.js
│   ├── styles/
│   │   ├── App.css
│   │   └── components.css
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

## Files

### `package.json`
```json
{
  "name": "unicorn-react-basic-example",
  "version": "1.0.0",
  "description": "Basic React integration with Unicorn.eth wallets",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx",
    "lint:fix": "eslint src --ext js,jsx --fix"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "thirdweb": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "vite": "^4.4.5"
  },
  "keywords": ["unicorn", "ethereum", "wallet", "web3", "thirdweb"],
  "author": "Unicorn.eth",
  "license": "MIT"
}
```

### `vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      process: 'process/browser',
      buffer: 'buffer',
      util: 'util',
    },
  },
  optimizeDeps: {
    include: ['process', 'buffer', 'util'],
  },
})
```

### `src/utils/unicornConfig.js`
```javascript
import { createThirdwebClient } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";

// Unicorn.eth official configuration
export const UNICORN_CLIENT_ID = "4e8c81182c3709ee441e30d776223354";
export const UNICORN_FACTORY_ADDRESS = "0xD771615c873ba5a2149D5312448cE01D677Ee48A";

// Create the Thirdweb client
export const client = createThirdwebClient({
  clientId: UNICORN_CLIENT_ID,
});

// Configure smart account wallets
export const unicornWallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: UNICORN_FACTORY_ADDRESS,
      chain: polygon,
      gasless: true,
    }
  })
];

// Supported chains for this dApp
export const supportedChains = [polygon];

// App metadata
export const APP_METADATA = {
  name: "Unicorn dApp Example",
  description: "Demonstrating seamless Unicorn.eth wallet integration",
  url: "https://your-dapp.com",
  icons: ["https://your-dapp.com/icon-192.png"],
};
```

### `src/hooks/useUnicornWallet.js`
```javascript
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { useEffect, useState } from "react";
import { polygon } from "thirdweb/chains";

export const useUnicornWallet = () => {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    if (account && wallet) {
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      
      // Verify we're on the correct chain
      const currentChain = wallet.getChain();
      if (currentChain?.id !== polygon.id) {
        console.warn(`⚠️ Connected to ${currentChain?.name}, expected Polygon`);
      }
    } else {
      setIsConnected(false);
      // Give AutoConnect some time to work
      const timer = setTimeout(() => {
        setIsConnecting(false);
        if (!account) {
          setConnectionError("Failed to auto-connect. Please ensure this dApp is accessed through a Unicorn App Center.");
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [account, wallet]);

  const disconnect = async () => {
    if (wallet) {
      try {
        await wallet.disconnect();
        setIsConnected(false);
        setConnectionError(null);
      } catch (error) {
        console.error("Failed to disconnect:", error);
      }
    }
  };

  return {
    // Wallet state
    account,
    wallet,
    isConnected,
    isConnecting,
    connectionError,
    
    // Convenience getters
    address: account?.address,
    chainId: wallet?.getChain()?.id,
    chainName: wallet?.getChain()?.name,
    
    // Actions
    disconnect,
  };
};
```

### `src/components/AppHeader.jsx`
```jsx
import React from 'react';

const AppHeader = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <span className="unicorn-logo">🦄</span>
          <div className="title-section">
            <h1>Unicorn dApp Example</h1>
            <p className="subtitle">Seamless Web3 wallet integration</p>
          </div>
        </div>
        
        <div className="status-badges">
          <span className="badge polygon-badge">Polygon</span>
          <span className="badge gasless-badge">Gasless</span>
          <span className="badge secure-badge">Secure</span>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
```

### `src/components/UnicornConnect.jsx`
```jsx
import React from 'react';
import { AutoConnect } from "thirdweb/react";
import { client, unicornWallets } from '../utils/unicornConfig';

const UnicornConnect = ({ onConnect, onError }) => {
  const handleConnect = (wallet) => {
    console.log("🦄 Unicorn wallet connected successfully");
    console.log("Address:", wallet.getAddress());
    console.log("Chain:", wallet.getChain()?.name);
    
    if (onConnect) {
      onConnect(wallet);
    }
  };

  const handleError = (error) => {
    console.error("❌ Unicorn wallet connection failed:", error);
    console.error("Error details:", error.message);
    
    if (onError) {
      onError(error);
    }
  };

  return (
    <AutoConnect
      client={client}
      wallets={unicornWallets}
      onConnect={handleConnect}
      onError={handleError}
    />
  );
};

export default UnicornConnect;
```

### `src/components/WalletInfo.jsx`
```jsx
import React from 'react';
import { useUnicornWallet } from '../hooks/useUnicornWallet';

const WalletInfo = () => {
  const { account, wallet, address, chainName, disconnect } = useUnicornWallet();

  if (!account || !wallet) {
    return null;
  }

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="wallet-info-card">
      <div className="card-header">
        <h3>🦄 Wallet Connected</h3>
        <button 
          onClick={disconnect}
          className="disconnect-btn"
          title="Disconnect wallet"
        >
          ⏏️
        </button>
      </div>
      
      <div className="wallet-details">
        <div className="detail-row">
          <span className="label">Address:</span>
          <span className="value address-value" title={address}>
            {formatAddress(address)}
          </span>
        </div>
        
        <div className="detail-row">
          <span className="label">Network:</span>
          <span className="value">{chainName || 'Unknown'}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Type:</span>
          <span className="value">Smart Account</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Gas:</span>
          <span className="value gasless-indicator">
            <span className="status-dot"></span>
            Sponsored
          </span>
        </div>
      </div>
      
      <div className="connection-status">
        <span className="status-indicator connected">
          <span className="pulse-dot"></span>
          Connected & Ready
        </span>
      </div>
    </div>
  );
};

export default WalletInfo;
```

### `src/components/TransactionDemo.jsx`
```jsx
import React, { useState } from 'react';
import { prepareContractCall, sendTransaction, getContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { client } from '../utils/unicornConfig';
import { polygon } from "thirdweb/chains";

// Example contract - USDC on Polygon for balance checking
const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

const TransactionDemo = () => {
  const account = useActiveAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [balance, setBalance] = useState('');

  const checkBalance = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const contract = getContract({
        client,
        chain: polygon,
        address: USDC_ADDRESS,
      });

      // Read balance (no transaction needed)
      const balanceResult = await contract.read("balanceOf", [account.address]);
      const formattedBalance = (Number(balanceResult) / 1e6).toFixed(2); // USDC has 6 decimals
      setBalance(formattedBalance);
    } catch (err) {
      console.error("❌ Balance check failed:", err);
      setError(err.message || 'Failed to check balance');
    } finally {
      setIsLoading(false);
    }
  };

  const sendDemoTransaction = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      const contract = getContract({
        client,
        chain: polygon,
        address: USDC_ADDRESS,
      });

      // Prepare a simple approve transaction (0 amount, safe)
      const transaction = prepareContractCall({
        contract,
        method: "approve",
        params: [account.address, 0], // Approve 0 tokens to self (safe demo)
      });

      // Send the gasless transaction
      const result = await sendTransaction({
        transaction,
        account,
      });

      setTxHash(result.transactionHash);
      console.log("✅ Demo transaction successful:", result);
    } catch (err) {
      console.error("❌ Transaction failed:", err);
      if (err.message.includes("user rejected")) {
        setError('Transaction was cancelled');
      } else if (err.message.includes("insufficient funds")) {
        setError('Gasless sponsorship failed - please contact support');
      } else {
        setError(err.message || 'Transaction failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="transaction-demo-card">
      <div className="card-header">
        <h3>🔄 Transaction Demo</h3>
        <p>Test your Unicorn wallet with gasless transactions</p>
      </div>

      <div className="demo-actions">
        <button 
          onClick={checkBalance}
          disabled={!account || isLoading}
          className="demo-button secondary"
        >
          {isLoading && balance === '' ? '⏳ Checking...' : '💰 Check USDC Balance'}
        </button>

        {balance && (
          <div className="balance-display">
            <span className="balance-label">USDC Balance:</span>
            <span className="balance-amount">{balance} USDC</span>
          </div>
        )}

        <button 
          onClick={sendDemoTransaction}
          disabled={!account || isLoading}
          className="demo-button primary"
        >
          {isLoading && !balance ? '⏳ Processing...' : '🚀 Send Demo Transaction'}
        </button>

        <p className="demo-note">
          ℹ️ This demo sends a safe, gasless transaction to test your integration
        </p>
      </div>

      {txHash && (
        <div className="success-message">
          <h4>✅ Transaction Successful!</h4>
          <div className="tx-details">
            <span className="tx-label">Hash:</span>
            <span className="tx-hash" title={txHash}>
              {`${txHash.slice(0, 10)}...${txHash.slice(-8)}`}
            </span>
          </div>
          <a 
            href={`https://polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
          >
            View on Polygonscan →
          </a>
        </div>
      )}

      {error && (
        <div className="error-message">
          <h4>❌ Error</h4>
          <p>{error}</p>
          <button 
            onClick={() => setError('')}
            className="close-error-btn"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionDemo;
```

### `src/App.jsx`
```jsx
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
```

### `src/main.jsx`
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Global polyfills for Web3 compatibility
if (typeof global === 'undefined') {
  var global = globalThis;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### `public/index.html`
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Unicorn.eth dApp integration example" />
    <meta name="theme-color" content="#6b46c1" />
    <title>Unicorn dApp Example</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### `README.md`
```markdown
# Unicorn React Basic Example

This is a complete React application demonstrating how to integrate Unicorn.eth wallet connectivity using the Thirdweb SDK.

## Features

- ✅ AutoConnect integration
- ✅ Wallet state management
- ✅ Gasless transaction demos
- ✅ Error handling and debugging
- ✅ Mobile-responsive design
- ✅ TypeScript ready

## Quick Start

```bash
# Clone the repository
git clone https://github.com/MyUnicornAccount/ConnectToUs.git
cd ConnectToUs/examples/react-basic

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## What This Example Shows

1. **Basic Integration**: How to set up AutoConnect with minimal configuration
2. **Wallet Management**: Using hooks to manage wallet state
3. **Transaction Handling**: Sending gasless transactions
4. **Error Handling**: Proper error boundaries and user feedback
5. **UI Components**: Reusable components for wallet info and transactions

## Key Files

- `src/utils/unicornConfig.js` - Wallet configuration
- `src/hooks/useUnicornWallet.js` - Custom wallet hook
- `src/components/UnicornConnect.jsx` - AutoConnect wrapper
- `src/components/WalletInfo.jsx` - Wallet status display
- `src/components/TransactionDemo.jsx` - Transaction examples

## Customization

To adapt this example for your dApp:

1. Replace demo transactions with your contract calls
2. Update the UI theme and branding
3. Add your specific business logic
4. Configure for your target networks

## Deployment

Before deploying to production:

1. Update the domain in your App Center submission
2. Test thoroughly on your target network
3. Ensure HTTPS is configured
4. Submit for whitelist approval

## Need Help?

- Check the [Troubleshooting Guide](../../TROUBLESHOOTING.md)
- Join our [Discord community](https://discord.gg/unicorn-developers)
- Create an [issue](https://github.com/MyUnicornAccount/ConnectToUs/issues)
```

This complete React example provides:

- **Production-ready code** with proper error handling
- **Comprehensive comments** explaining each part
- **Modular architecture** that's easy to customize
- **Best practices** for Unicorn wallet integration
- **Mobile responsiveness** and modern UI
- **Debug-friendly** logging and error messages

Developers can clone this, run `npm install && npm run dev`, and have a working Unicorn dApp immediately!