'use client';

import { useEffect, useState } from "react";
import { AutoConnect, useActiveAccount, useActiveWallet } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";

const client = createThirdwebClient({
  clientId: "4e8c81182c3709ee441e30d776223354",
});

const wallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
      chain: polygon,
      gasless: true,
    }
  })
];

export default function UnicornAutoConnect() {
  const [isClient, setIsClient] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed' | 'idle'>('idle');
  
  // Use Thirdweb hooks to track wallet state
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update connection status based on account state
  useEffect(() => {
    if (activeAccount && activeWallet) {
      setConnectionStatus('connected');
      console.log("✅ Connected to Unicorn wallet:", activeAccount.address);
    } else if (connectionStatus === 'connecting') {
      // Keep connecting state if we're in the process
    } else {
      setConnectionStatus('idle');
    }
  }, [activeAccount, activeWallet, connectionStatus]);

  const handleConnect = async (wallet: any) => {
    try {
      setConnectionStatus('connecting');
      console.log("🔍 Wallet object:", wallet);
      
      let address: string;
      
      // Try different ways to get the address based on Thirdweb v5 API
      if (wallet.getAddress) {
        address = await wallet.getAddress();
      } else if (wallet.address) {
        address = wallet.address;
      } else if (wallet.account?.address) {
        address = wallet.account.address;
      } else {
        throw new Error("Could not find wallet address");
      }
      
      console.log("✅ Wallet connected with address:", address);
    } catch (error) {
      console.error("❌ Connection failed:", error);
      setConnectionStatus('failed');
    }
  };

  const handleError = (error: any) => {
    console.error("❌ AutoConnect error:", error);
    setConnectionStatus('failed');
  };

  // Prevent hydration mismatch by only rendering on client
  if (!isClient) {
    return <div className="text-center p-4">Loading Web3...</div>;
  }

  return (
    <div className="space-y-4">
      <AutoConnect
        client={client}
        wallets={wallets}
        onConnect={handleConnect}
        onError={handleError}
      />
      
      <div className="text-center">
        {connectionStatus === 'connecting' && (
          <p className="text-blue-600">🔄 Connecting to Unicorn wallet...</p>
        )}
        {connectionStatus === 'connected' && activeAccount && (
          <div className="space-y-2">
            <p className="text-green-600">✅ Connected!</p>
            <p className="text-sm text-gray-600">
              Address: {activeAccount.address.slice(0, 6)}...{activeAccount.address.slice(-4)}
            </p>
          </div>
        )}
        {connectionStatus === 'failed' && (
          <p className="text-red-600">❌ Connection failed. Please try again.</p>
        )}
        {connectionStatus === 'idle' && !activeAccount && (
          <p className="text-gray-600">Ready to connect your Unicorn wallet</p>
        )}
      </div>
    </div>
  );
}