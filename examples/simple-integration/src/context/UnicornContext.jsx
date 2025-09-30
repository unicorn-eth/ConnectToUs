// src/context/UnicornContext.jsx - Simple context for sharing Unicorn wallet state
import React, { createContext, useContext, useState } from 'react';

const UnicornContext = createContext();

export function UnicornProvider({ children }) {
  const [unicornWallet, setUnicornWallet] = useState(null);
  const [unicornAddress, setUnicornAddress] = useState(null);

  const handleUnicornConnect = (wallet, address) => {
    setUnicornWallet(wallet);
    setUnicornAddress(address);
    
    // Use a custom event to communicate without React warnings
    window.dispatchEvent(new CustomEvent('unicorn-wallet-connected', {
      detail: { wallet, address }
    }));
  };

  const handleUnicornDisconnect = () => {
    setUnicornWallet(null);
    setUnicornAddress(null);
    
    window.dispatchEvent(new CustomEvent('unicorn-wallet-disconnected'));
  };

  return (
    <UnicornContext.Provider value={{
      unicornWallet,
      unicornAddress,
      handleUnicornConnect,
      handleUnicornDisconnect,
      isUnicornConnected: !!unicornWallet
    }}>
      {children}
    </UnicornContext.Provider>
  );
}

export function useUnicorn() {
  const context = useContext(UnicornContext);
  if (!context) {
    throw new Error('useUnicorn must be used within UnicornProvider');
  }
  return context;
}