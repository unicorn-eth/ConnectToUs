// Coded lovingly by @cryptowampum and Claude AI
// src/hooks/useUniversalWallet.js - Bridge Unicorn wallet to work with existing Wagmi code
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

export const useUniversalWallet = () => {
  const wagmiAccount = useAccount();
  const [unicornWallet, setUnicornWallet] = useState(null);
  const [unicornAddress, setUnicornAddress] = useState(null);

  // Listen for Unicorn wallet events
  useEffect(() => {
    const handleUnicornConnect = (event) => {
      setUnicornWallet(event.detail.wallet);
      setUnicornAddress(event.detail.address);
    };

    const handleUnicornDisconnect = () => {
      setUnicornWallet(null);
      setUnicornAddress(null);
    };

    window.addEventListener('unicorn-wallet-connected', handleUnicornConnect);
    window.addEventListener('unicorn-wallet-disconnected', handleUnicornDisconnect);

    return () => {
      window.removeEventListener('unicorn-wallet-connected', handleUnicornConnect);
      window.removeEventListener('unicorn-wallet-disconnected', handleUnicornDisconnect);
    };
  }, []);

  // Create a unified wallet interface that existing app code can use
  const unifiedWallet = {
    // Connection state - prioritize Wagmi, fallback to Unicorn
    isConnected: wagmiAccount.isConnected || !!unicornWallet,
    address: wagmiAccount.address || unicornAddress,
    
    // Wallet info
    connector: wagmiAccount.connector || (unicornWallet ? { name: 'Unicorn', id: 'unicorn' } : null),
    isUnicorn: !!unicornWallet && !wagmiAccount.isConnected,
    isStandard: wagmiAccount.isConnected,
    
    // Raw wallet objects for advanced usage
    wagmiAccount,
    unicornWallet,
    
    // Send transaction function that works with both
    sendTransaction: async (txParams) => {
      if (wagmiAccount.isConnected) {
        // Use existing Wagmi transaction flow
        throw new Error('Use wagmi useSendTransaction hook for standard wallets');
      } else if (unicornWallet) {
        // Use Unicorn wallet
        return await unicornWallet.sendTransaction(txParams);
      } else {
        throw new Error('No wallet connected');
      }
    },
    
    // Disconnect function
    disconnect: () => {
      if (wagmiAccount.isConnected) {
        // Use existing Wagmi disconnect
        wagmiAccount.disconnect?.();
      } else if (unicornWallet) {
        // Disconnect Unicorn
        window.dispatchEvent(new CustomEvent('unicorn-wallet-disconnected'));
      }
    }
  };

  return unifiedWallet;
};