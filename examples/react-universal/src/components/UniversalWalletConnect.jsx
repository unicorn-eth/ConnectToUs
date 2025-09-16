// components/UniversalWalletConnection.jsx
// Coded lovingly by @cryptowampum and Claude AI
import React, { useState, useEffect } from 'react';
import { ConnectWallet, useActiveWallet } from "thirdweb/react";
import { AutoConnect } from "thirdweb/react";
import { client, unicornWallets } from '../utils/unicornConfig';

const UniversalWalletConnection = () => {
  const activeWallet = useActiveWallet();
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);
  const [isUnicornEnvironment, setIsUnicornEnvironment] = useState(false);

  useEffect(() => {
    // Check if we're in Unicorn environment
    const checkEnvironment = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasUnicornParams = urlParams.has('walletId') || urlParams.has('authCookie');
      const isInIframe = window.self !== window.top;
      
      setIsUnicornEnvironment(hasUnicornParams || isInIframe);
    };
    
    checkEnvironment();
  }, []);

  const handleAutoConnectComplete = (wallet) => {
    console.log("AutoConnect successful:", wallet);
    setAutoConnectAttempted(true);
  };

  const handleAutoConnectError = (error) => {
    console.log("AutoConnect failed silently, other wallets still available");
    setAutoConnectAttempted(true);
    // Don't show error to user - let them choose manually
  };

  return (
    <div className="wallet-connection">
      {/* Always show the standard Connect button */}
      <ConnectWallet
        theme="light"
        modalTitle="Connect Wallet"
        // Include ALL wallet options
        supportedWallets={[
          unicornWallets[0], // Unicorn wallet as an option
          "metamask",
          "walletconnect", 
          "coinbase",
          "rainbow",
          "trust"
        ]}
        // Show switch network button
        showNetworkSelector={true}
      />

      {/* Silent AutoConnect - doesn't block other connections */}
      {isUnicornEnvironment && !activeWallet && !autoConnectAttempted && (
        <div style={{ display: 'none' }}>
          <AutoConnect
            client={client}
            wallets={unicornWallets}
            onConnect={handleAutoConnectComplete}
            onError={handleAutoConnectError}
            timeout={3000} // Give up after 3 seconds
          />
        </div>
      )}

      {/* Optional: Show connection source */}
      {activeWallet && isUnicornEnvironment && (
        <div className="connection-info">
          Connected via: {activeWallet.id === 'inApp' ? '🦄 Unicorn' : activeWallet.id}
        </div>
      )}
    </div>
  );
};

export default UniversalWalletConnection;