// Coded lovingly by @cryptowampum and Claude AI
// src/context/UnicornContext.jsx - Share Unicorn wallet state across app
import React, { createContext, useContext, useState, useEffect } from 'react';

const UnicornContext = createContext();

export function UnicornProvider({ children }) {
  const [unicornWallet, setUnicornWallet] = useState(null);
  const [unicornAddress, setUnicornAddress] = useState(null);
  const [isUnicornConnected, setIsUnicornConnected] = useState(false);

  // Function to be called when Unicorn connects
  const handleUnicornConnect = (wallet, address) => {
    console.log('🦄 Unicorn connected in context:', address);
    setUnicornWallet(wallet);
    setUnicornAddress(address);
    setIsUnicornConnected(true);
  };

  // Function to disconnect
  const handleUnicornDisconnect = () => {
    console.log('🦄 Unicorn disconnected');
    setUnicornWallet(null);
    setUnicornAddress(null);
    setIsUnicornConnected(false);
  };

  return (
    <UnicornContext.Provider value={{
      unicornWallet,
      unicornAddress,
      isUnicornConnected,
      handleUnicornConnect,
      handleUnicornDisconnect
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