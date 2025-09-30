// Coded lovingly by @cryptowampum and Claude AI
// UnicornAutoConnect.jsx - Completely isolated version to avoid provider conflicts
// This version renders in a separate React root to eliminate all React warnings

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThirdwebProvider, AutoConnect } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { inAppWallet } from 'thirdweb/wallets';
import { base, polygon, ethereum, arbitrum, optimism } from 'thirdweb/chains';

// Simple chain mapping
const getChainByName = (chainName) => {
  const chains = {
    'base': base,
    'polygon': polygon, 
    'ethereum': ethereum,
    'mainnet': ethereum,
    'arbitrum': arbitrum,
    'optimism': optimism,
  };
  return chains[chainName?.toLowerCase()] || base;
};

// Simple environment detection - only runs when accessed via Unicorn portal
const isUnicornEnvironment = () => {
  if (typeof window === 'undefined') return false;
  
  const params = new URLSearchParams(window.location.search);
  const walletId = params.get('walletId');
  const authCookie = params.get('authCookie');
  
  // Must have both parameters to be considered Unicorn environment
  return walletId === 'inApp' && authCookie;
};

// Isolated AutoConnect component that renders in its own React root
const IsolatedAutoConnect = ({ 
  onConnect, 
  onError,
  clientId,
  factoryAddress,
  defaultChain = 'base',
  timeout = 5000,
  debug = false
}) => {
  // Configuration with fallbacks
  const finalClientId = clientId || 
    import.meta.env.VITE_THIRDWEB_CLIENT_ID || 
    "4e8c81182c3709ee441e30d776223354";
    
  const finalFactoryAddress = factoryAddress || 
    import.meta.env.VITE_THIRDWEB_FACTORY_ADDRESS || 
    "0xD771615c873ba5a2149D5312448cE01D677Ee48A";
    
  const finalChain = getChainByName(
    import.meta.env.VITE_DEFAULT_CHAIN || defaultChain
  );

  if (debug) {
    console.log('🦄 IsolatedAutoConnect: Configuration', {
      clientId: finalClientId.slice(0, 8) + '...',
      factoryAddress: finalFactoryAddress.slice(0, 8) + '...',
      chain: finalChain.name,
      timeout
    });
  }

  const client = createThirdwebClient({
    clientId: finalClientId
  });
  
  const wallet = inAppWallet({
    smartAccount: {
      factoryAddress: finalFactoryAddress,
      chain: finalChain,
      gasless: true,
    }
  });

  return (
    <ThirdwebProvider>
      <AutoConnect
        client={client}
        wallets={[wallet]}
        onConnect={(connectedWallet) => {
          // Extract wallet address properly
          let walletAddress = 'Unknown';
          try {
            const account = connectedWallet.getAccount?.();
            walletAddress = account?.address || connectedWallet.address || 'No address found';
          } catch (e) {
            console.warn('Could not extract wallet address:', e);
          }
          
          if (debug) {
            console.log('🦄 IsolatedAutoConnect: Success!');
            console.log('Chain:', finalChain.name);
            console.log('Address:', walletAddress);
            console.log('Available methods:', Object.getOwnPropertyNames(connectedWallet));
          }
          
          // Call user-provided callback
          onConnect?.(connectedWallet);
        }}
        onError={(error) => {
          if (debug) {
            console.log('🦄 IsolatedAutoConnect: Failed (silently)');
            console.error('Error details:', error);
          }
          
          // Call user-provided callback but don't show errors to user
          onError?.(error);
        }}
        timeout={timeout}
      />
    </ThirdwebProvider>
  );
};

// Main UnicornAutoConnect component that creates isolated React root
const UnicornAutoConnect = (props) => {
  React.useEffect(() => {
    // Only run if in Unicorn environment
    if (!isUnicornEnvironment()) {
      if (props.debug) {
        console.log('🦄 UnicornAutoConnect: Not in Unicorn environment, skipping');
      }
      return;
    }

    if (props.debug) {
      console.log('🦄 UnicornAutoConnect: Creating isolated React root for AutoConnect');
    }

    // Create a completely separate React root to avoid provider conflicts
    const container = document.createElement('div');
    container.style.display = 'none';
    container.id = 'unicorn-autoconnect-root';
    document.body.appendChild(container);
    
    const root = ReactDOM.createRoot(container);
    
    // Small delay to ensure other providers are ready
    const timer = setTimeout(() => {
      if (props.debug) {
        console.log('🦄 UnicornAutoConnect: Rendering isolated AutoConnect');
      }
      root.render(<IsolatedAutoConnect {...props} />);
    }, 300);

    // Cleanup function
    return () => {
      if (props.debug) {
        console.log('🦄 UnicornAutoConnect: Cleaning up isolated React root');
      }
      clearTimeout(timer);
      setTimeout(() => {
        try {
          root.unmount();
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        } catch (e) {
          console.warn('UnicornAutoConnect cleanup warning:', e);
        }
      }, 100);
    };
  }, []); // Empty dependency array ensures this only runs once

  return null; // This component doesn't render anything in the main React tree
};

export default UnicornAutoConnect;