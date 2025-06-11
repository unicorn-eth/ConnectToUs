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