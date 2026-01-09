// src/components/UnicornAutoConnect.jsx - Updated with modular configuration
// Coded lovingly by @cryptowampum and Claude AI

import React from 'react';
import { AutoConnect } from 'thirdweb/react';
import { useUnicorn } from '../context/UnicornContext';
import { 
  thirdwebClient, 
  createUnicornWalletFromUrl, 
  getChainFromUrl,
  config 
} from '../config/thirdweb';

function UnicornAutoConnect() {
  const { handleUnicornConnect } = useUnicorn();
  
  // Get configuration from environment and URL
  const chain = getChainFromUrl();
  const wallet = createUnicornWalletFromUrl();
  
  if (config.enableDebug) {
    console.log('🦄 AutoConnect configuration:', {
      chain: chain.name,
      chainId: chain.id,
      factoryAddress: config.factoryAddress,
      enableAutoConnect: config.enableAutoConnect,
    });
  }
  
  // Don't render if AutoConnect is disabled
  if (!config.enableAutoConnect) {
    if (config.enableDebug) {
      console.log('🦄 AutoConnect disabled by configuration');
    }
    return null;
  }
  
  return (
    <AutoConnect
      client={thirdwebClient}
      wallets={[wallet]}
      accountAbstraction={{
        chain: chain,
        gasless: true,
        factoryAddress: config.factoryAddress,
      }}
      onConnect={(connectedWallet) => {
        if (config.enableDebug) {
          console.log('🦄 Unicorn wallet auto-connected successfully!');
          console.log('Chain:', chain.name, '(' + chain.id + ')');
          console.log('Wallet:', connectedWallet);
        }
        
        // Get the address
        const account = connectedWallet.getAccount?.();
        const address = account?.address;
        
        if (config.enableDebug) {
          console.log('Address:', address);
        }
        
        // Store in context so other components can see it
        handleUnicornConnect(connectedWallet, address);
        
        // Optional: Store connection info for debugging/analytics
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('unicorn_last_connection', JSON.stringify({
              timestamp: Date.now(),
              chain: chain.name,
              chainId: chain.id,
              address: address,
              factoryAddress: config.factoryAddress,
            }));
          } catch (e) {
            console.warn('Could not save connection info:', e);
          }
        }
      }}
      onError={(error) => {
        if (config.enableDebug) {
          console.error('❌ Unicorn AutoConnect failed:', error);
          console.log('Configuration used:', {
            chain: chain.name,
            factoryAddress: config.factoryAddress,
            clientId: config.clientId,
          });
        }
        
        // Optional: Track failed connections for debugging
        if (typeof window !== 'undefined') {
          try {
            const failureInfo = {
              timestamp: Date.now(),
              error: error.message,
              chain: chain.name,
              chainId: chain.id,
              factoryAddress: config.factoryAddress,
              userAgent: navigator.userAgent,
              url: window.location.href,
            };
            
            sessionStorage.setItem('unicorn_last_error', JSON.stringify(failureInfo));
            
            if (config.enableDebug) {
              console.log('🔍 Debug info saved to sessionStorage.unicorn_last_error');
            }
          } catch (e) {
            console.warn('Could not save error info:', e);
          }
        }
      }}
      timeout={5000}
    />
  );
}

export default UnicornAutoConnect;