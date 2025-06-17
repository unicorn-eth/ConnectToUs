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