# Example Project Structure

## File Structure
```
unicorn-dapp-example/
├── src/
│   ├── components/
│   │   ├── UnicornConnect.jsx
│   │   ├── WalletInfo.jsx
│   │   └── TransactionDemo.jsx
│   ├── hooks/
│   │   └── useUnicornWallet.js
│   ├── utils/
│   │   └── unicornConfig.js
│   ├── App.jsx
│   └── main.jsx
├── public/
│   └── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Core Files

### `package.json`
```json
{
  "name": "unicorn-dapp-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
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
  }
}
```

### `src/utils/unicornConfig.js`
```javascript
import { createThirdwebClient } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";

// Unicorn.eth configuration
export const UNICORN_CLIENT_ID = "4e8c81182c3709ee441e30d776223354";
export const UNICORN_FACTORY_ADDRESS = "0xD771615c873ba5a2149D5312448cE01D677Ee48A";

// Create the Thirdweb client
export const client = createThirdwebClient({
  clientId: UNICORN_CLIENT_ID,
});

// Configure the wallet with account abstraction
export const unicornWallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: UNICORN_FACTORY_ADDRESS,
      chain: polygon,
      gasless: true,
    }
  })
];

// Supported chains
export const supportedChains = [polygon];
```

### `src/components/UnicornConnect.jsx`
```jsx
import React from 'react';
import { AutoConnect } from "thirdweb/react";
import { client, unicornWallets } from '../utils/unicornConfig';

const UnicornConnect = ({ onConnect, onError }) => {
  const handleConnect = (wallet) => {
    console.log("🦄 Unicorn wallet connected:", wallet);
    if (onConnect) {
      onConnect(wallet);
    }
  };

  const handleError = (error) => {
    console.error("❌ Unicorn connection failed:", error);
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
import { useActiveAccount, useActiveWallet } from "thirdweb/react";

const WalletInfo = () => {
  const account = useActiveAccount();
  const wallet = useActiveWallet();

  if (!account || !wallet) {
    return (
      <div className="wallet-info">
        <p>🔌 Connecting to Unicorn wallet...</p>
      </div>
    );
  }

  return (
    <div className="wallet-info">
      <h3>🦄 Unicorn Wallet Connected</h3>
      <div className="wallet-details">
        <p><strong>Address:</strong> {account.address}</p>
        <p><strong>Chain:</strong> {wallet.getChain()?.name || 'Unknown'}</p>
        <p><strong>Type:</strong> Smart Account</p>
        <div className="status-indicator">
          <span className="status-dot"></span>
          Connected & Ready
        </div>
      </div>
    </div>
  );
};

export default WalletInfo;
```

### `src/components/TransactionDemo.jsx`
```jsx
import React, { useState } from 'react';
import { prepareContractCall, sendTransaction } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import { client } from '../utils/unicornConfig';
import { polygon } from "thirdweb/chains";

// Example ERC-20 token contract (you can replace with your own)
const DEMO_TOKEN_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC on Polygon

const TransactionDemo = () => {
  const account = useActiveAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const handleDemoTransaction = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      // Get the demo contract
      const contract = getContract({
        client,
        chain: polygon,
        address: DEMO_TOKEN_ADDRESS,
      });

      // Prepare a simple contract call (checking balance - no gas needed)
      const transaction = prepareContractCall({
        contract,
        method: "balanceOf",
        params: [account.address],
      });

      // Send the transaction (gasless thanks to account abstraction)
      const result = await sendTransaction({
        transaction,
        account,
      });

      setTxHash(result.transactionHash);
      console.log("✅ Transaction successful:", result);
    } catch (err) {
      console.error("❌ Transaction failed:", err);
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="transaction-demo">
      <h3>🔄 Demo Transaction</h3>
      <p>Test your Unicorn wallet integration with a gasless transaction</p>
      
      <button 
        onClick={handleDemoTransaction}
        disabled={!account || isLoading}
        className="demo-button"
      >
        {isLoading ? '⏳ Processing...' : '🚀 Send Demo Transaction'}
      </button>

      {txHash && (
        <div className="success-message">
          <p>✅ Transaction successful!</p>
          <a 
            href={`https://polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
          >
            View on Polygonscan
          </a>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default TransactionDemo;
```

### `src/hooks/useUnicornWallet.js`
```javascript
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { useEffect, useState } from "react";

export const useUnicornWallet = () => {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    if (account && wallet) {
      setIsConnected(true);
      setIsConnecting(false);
    } else {
      setIsConnected(false);
      // Give some time for auto-connect to work
      const timer = setTimeout(() => {
        setIsConnecting(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [account, wallet]);

  return {
    account,
    wallet,
    isConnected,
    isConnecting,
    address: account?.address,
    chainId: wallet?.getChain()?.id,
  };
};
```

### `src/App.jsx`
```jsx
import React, { useState } from 'react';
import { ThirdwebProvider } from "thirdweb/react";
import UnicornConnect from './components/UnicornConnect';
import WalletInfo from './components/WalletInfo';
import TransactionDemo from './components/TransactionDemo';
import { useUnicornWallet } from './hooks/useUnicornWallet';
import './App.css';

function AppContent() {
  const { isConnected, isConnecting } = useUnicornWallet();
  const [connectionError, setConnectionError] = useState('');

  const handleConnectionError = (error) => {
    setConnectionError(error.message || 'Failed to connect to Unicorn wallet');
  };

  if (isConnecting) {
    return (
      <div className="app-loading">
        <div className="unicorn-logo">🦄</div>
        <h2>Connecting to Unicorn Wallet...</h2>
        <p>Please wait while we establish a secure connection</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>🦄 Unicorn dApp Example</h1>
        <p>Demonstrating seamless Unicorn.eth wallet integration</p>
      </header>

      <main className="app-main">
        {connectionError && (
          <div className="error-banner">
            <p>❌ Connection Error: {connectionError}</p>
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        )}

        {isConnected ? (
          <div className="connected-state">
            <WalletInfo />
            <TransactionDemo />
          </div>
        ) : (
          <div className="disconnected-state">
            <h2>Welcome to Unicorn dApp</h2>
            <p>This dApp will automatically connect to your Unicorn wallet.</p>
            <p>If you don't see a connection, please check:</p>
            <ul>
              <li>You're accessing this dApp through a Unicorn App Center</li>
              <li>Your browser allows the necessary permissions</li>
              <li>This dApp is whitelisted in your community settings</li>
            </ul>
          </div>
        )}
      </main>

      <UnicornConnect onError={handleConnectionError} />
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

### `src/App.css`
```css
.App {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.app-header {
  margin-bottom: 40px;
}

.app-header h1 {
  color: #6b46c1;
  margin-bottom: 10px;
}

.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.unicorn-logo {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.wallet-info {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.wallet-details p {
  margin: 8px 0;
  text-align: left;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
  color: #16a34a;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #16a34a;
  border-radius: 50%;
  margin-right: 8px;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.transaction-demo {
  background: #fef7ff;
  border: 2px solid #e879f9;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.demo-button {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin: 10px 0;
  transition: background-color 0.2s;
}

.demo-button:hover:not(:disabled) {
  background: #7c3aed;
}

.demo-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  background: #dcfce7;
  border: 1px solid #22c55e;
  border-radius: 8px;
  padding: 10px;
  margin: 10px 0;
}

.error-message, .error-banner {
  background: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 10px;
  margin: 10px 0;
  color: #dc2626;
}

.tx-link {
  color: #8b5cf6;
  text-decoration: none;
  font-weight: 600;
}

.tx-link:hover {
  text-decoration: underline;
}

.disconnected-state {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 30px;
  margin: 20px 0;
}

.disconnected-state ul {
  text-align: left;
  max-width: 500px;
  margin: 0 auto;
}

.disconnected-state li {
  margin: 8px 0;
}
```