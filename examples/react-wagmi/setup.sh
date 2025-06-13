#!/bin/bash

echo "🦄 Setting up Unicorn Wagmi Example..."

# Create directories
mkdir -p src/{components,hooks,config}

# Create package.json
cat > package.json << 'EOF'
{
  "name": "unicorn-wagmi-example",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "thirdweb": "^5.0.0",
    "wagmi": "^2.0.0",
    "@tanstack/react-query": "^5.0.0",
    "viem": "^2.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.5"
  }
}
EOF

# Create vite.config.js
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: { global: 'globalThis' }
})
EOF

# Create index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unicorn Wagmi Example</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
EOF

# Create src/main.jsx
cat > src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

if (typeof global === 'undefined') {
  var global = globalThis;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
EOF

# Create src/config/wagmi.js
cat > src/config/wagmi.js << 'EOF'
import { createConfig, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { createThirdwebClient } from "thirdweb";

export const wagmiConfig = createConfig({
  chains: [polygon],
  connectors: [injected()],
  transports: { [polygon.id]: http() }
});

export const thirdwebClient = createThirdwebClient({
  clientId: "4e8c81182c3709ee441e30d776223354"
});

export const UNICORN_FACTORY_ADDRESS = "0xD771615c873ba5a2149D5312448cE01D677Ee48A";
EOF

# Create src/hooks/useUnicornAccount.js
cat > src/hooks/useUnicornAccount.js << 'EOF'
import { useState, useEffect } from 'react';
import { autoConnect, EIP1193 } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";
import { thirdwebClient, UNICORN_FACTORY_ADDRESS } from '../config/wagmi';

export const useUnicornAccount = () => {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);

  const connectUnicornWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      const connectedWallet = await autoConnect({
        client: thirdwebClient,
        accountAbstraction: {
          chain: polygon,
          sponsorGas: true,
          factoryAddress: UNICORN_FACTORY_ADDRESS,
        }
      });

      if (connectedWallet) {
        setWallet(connectedWallet);
        setIsConnected(true);
        
        const eip1193Provider = EIP1193.toProvider({
          wallet: connectedWallet,
          chain: polygon,
          client: thirdwebClient,
        });
        setProvider(eip1193Provider);
        
        const walletAddress = await connectedWallet.getAddress();
        setAddress(walletAddress);
      } else {
        throw new Error('AutoConnect failed');
      }
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (wallet) await wallet.disconnect();
    setWallet(null);
    setProvider(null);
    setAddress(null);
    setIsConnected(false);
    setError(null);
  };

  useEffect(() => {
    connectUnicornWallet();
  }, []);

  return {
    wallet, provider, address, isConnected, isConnecting, error,
    formattedAddress: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '',
    connectUnicornWallet, disconnect
  };
};
EOF

# Create src/components/ConnectButton.jsx
cat > src/components/ConnectButton.jsx << 'EOF'
import React from 'react';
import { useUnicornAccount } from '../hooks/useUnicornAccount';

const ConnectButton = () => {
  const { isConnected, isConnecting, formattedAddress, connectUnicornWallet, disconnect, error } = useUnicornAccount();

  if (isConnecting) {
    return <button disabled>Connecting...</button>;
  }

  if (isConnected) {
    return (
      <div>
        <span>🦄 {formattedAddress}</span>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={connectUnicornWallet}>Connect Unicorn Wallet</button>
      {error && <p style={{color: 'red'}}>❌ {error}</p>}
    </div>
  );
};

export default ConnectButton;
EOF

# Create src/components/WalletStatus.jsx
cat > src/components/WalletStatus.jsx << 'EOF'
import React from 'react';
import { useUnicornAccount } from '../hooks/useUnicornAccount';

const WalletStatus = () => {
  const { address, isConnected } = useUnicornAccount();

  if (!isConnected) {
    return <div><h3>Wallet Status</h3><p>Not connected</p></div>;
  }

  return (
    <div>
      <h3>Wallet Status</h3>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Type:</strong> 🦄 Unicorn Smart Account</p>
      <p><strong>Network:</strong> ✅ Polygon</p>
      <p><strong>Gas:</strong> ⚡ Sponsored</p>
    </div>
  );
};

export default WalletStatus;
EOF

# Create src/components/TransactionDemo.jsx
cat > src/components/TransactionDemo.jsx << 'EOF'
import React, { useState } from 'react';
import { useUnicornAccount } from '../hooks/useUnicornAccount';

const TransactionDemo = () => {
  const { address, isConnected, provider } = useUnicornAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const sendDemoTransaction = async () => {
    if (!address || !provider) return;

    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: address,
          value: '0x0',
          data: '0x'
        }],
      });
      setTxHash(hash);
    } catch (err) {
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3>🔄 Transaction Demo</h3>
      <button 
        onClick={sendDemoTransaction}
        disabled={!isConnected || isLoading}
      >
        {isLoading ? '⏳ Processing...' : '🚀 Send Demo Transaction'}
      </button>
      
      {txHash && (
        <div>
          <p>✅ Success: {txHash.slice(0, 10)}...{txHash.slice(-8)}</p>
          <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
            View on Polygonscan →
          </a>
        </div>
      )}
      
      {error && <p style={{color: 'red'}}>❌ {error}</p>}
    </div>
  );
};

export default TransactionDemo;
EOF

# Create src/App.jsx
cat > src/App.jsx << 'EOF'
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
EOF

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🎉 Setup complete!"
echo "Run: npm run dev"
echo "Then open: http://localhost:5173"