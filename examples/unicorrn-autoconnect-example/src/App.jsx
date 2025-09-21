// src/App.jsx
import React, { useState, useEffect } from 'react';
import { 
  ThirdwebProvider, 
  useActiveAccount, 
  AutoConnect
} from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";

// Import additional chains
import { base, arbitrum, optimism, ethereum } from "thirdweb/chains";

// Configuration
const CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID;
const FACTORY_ADDRESS = import.meta.env.VITE_THIRDWEB_FACTORY_ADDRESS || "0xD771615c873ba5a2149D5312448cE01D677Ee48A";

// Parse URL parameters
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    chain: params.get('chain'),
    walletID: params.get('walletID'),
    authCookie: params.get('authCookie')
  };
};

// Chain mapping - customize this, If you always use the same chain, then just use the one you need.
const getChainByName = (chainName) => {
  const chains = {
    'polygon': polygon,
    'base': base,
    'arbitrum': arbitrum,
    'optimism': optimism,
    'ethereum': ethereum,
    'mainnet': ethereum
  };
  return chains[chainName?.toLowerCase()] || polygon; // Default to polygon
};

const urlParams = getUrlParams();
const selectedChain = getChainByName(urlParams.chain);

const client = createThirdwebClient({
  clientId: CLIENT_ID || "",
});

// Configure smart wallet for existing unicorn.eth users
const supportedWallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: FACTORY_ADDRESS,
      chain: selectedChain,
      gasless: true,
      sponsorGas: true,
    }
  })
];

function App() {
  return (
    <ThirdwebProvider>
      <AutoConnect 
        client={client} 
        wallets={supportedWallets}
        timeout={15000}
        onConnect={(wallet) => {
          console.log("✅ Existing unicorn.eth wallet connected:", wallet);
          console.log("📍 Chain:", selectedChain.name);
          console.log("🔗 URL Params:", urlParams);
        }}
        onError={(error) => {
          console.log("❌ No existing unicorn.eth wallet found:", error);
          console.log("📍 Attempted chain:", selectedChain.name);
        }}
      />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <UnicornAccessDemo />
        </div>
      </div>
    </ThirdwebProvider>
  );
}

function UnicornAccessDemo() {
  const account = useActiveAccount();
  const [connectionState, setConnectionState] = useState("checking");

  useEffect(() => {
    if (account) {
      console.log("🦄 Authorized unicorn.eth user:", account.address);
      setConnectionState("authorized");
    } else {
      // After timeout, user doesn't have existing unicorn.eth wallet
      const timer = setTimeout(() => {
        if (!account) {
          console.log("⏰ Timeout: No existing unicorn.eth wallet found");
          setConnectionState("unauthorized");
        }
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, [account]);

  if (connectionState === "checking") {
    return (
      <div className="text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-pulse">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🔄 Checking for Unicorn.eth Wallet...
            </h2>
            <p className="text-gray-600 mb-2">
              Looking for existing smart wallet from unicorn.eth
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Chain: {selectedChain.name} ({selectedChain.id})
            </p>
            {urlParams.walletID && (
              <p className="text-xs text-blue-600 mb-4">
                Wallet ID: {urlParams.walletID}
              </p>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (connectionState === "unauthorized") {
    return (
      <div className="text-center">
        <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-red-500">
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            🚫 Access Restricted
          </h2>
          <p className="text-gray-700 mb-4">
            This dapp is only accessible to users with existing unicorn.eth smart wallets.
          </p>
          <p className="text-sm text-gray-600">
            Sign up at{" "}
            <a 
              href="https://polygon.ac/" 
              className="text-blue-600 hover:underline"
              target="_blank" 
              rel="noopener noreferrer"
            >
              polygon.ac
            </a>{" "}
            to get your unicorn.eth wallet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-green-500">
        <h2 className="text-2xl font-bold text-green-800 mb-4">
          🦄 Welcome, Unicorn.eth User!
        </h2>
        <p className="text-gray-700 mb-4">
          Your existing smart wallet has been detected and connected.
        </p>
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600">Connected Address:</p>
          <p className="font-mono text-sm text-gray-800">
            {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Chain: {selectedChain.name} ({selectedChain.id})
          </p>
          <p className="text-xs text-gray-500">
            Factory: {FACTORY_ADDRESS.slice(0, 6)}...{FACTORY_ADDRESS.slice(-4)}
          </p>
        </div>
        <div className="bg-purple-100 rounded-lg p-4">
          <p className="text-purple-800 font-semibold">
            ✅ Authorized Access Granted
          </p>
          <p className="text-sm text-purple-700 mt-2">
            You can now interact with this unicorn.eth exclusive dapp!
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;