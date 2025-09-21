// coded lovingly by @cryptowampum and Claude AI
// components/UnicornAutoConnect.jsx
import React, { useEffect, useState } from 'react';
import { AutoConnect } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { inAppWallet } from 'thirdweb/wallets';
import { polygon } from 'thirdweb/chains';

const UnicornAutoConnect = () => {
  const [client, setClient] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);
  const [autoConnectStatus, setAutoConnectStatus] = useState('pending');

  useEffect(() => {
    // Initialize Thirdweb client and wallets
    const initializeUnicorn = () => {
      try {
        // Create Thirdweb client
        const thirdwebClient = createThirdwebClient({
          clientId: import.meta.env.VITE_UNICORN_CLIENT_ID || "4e8c81182c3709ee441e30d776223354",
        });

        // Configure Unicorn wallet with smart account
        const unicornWallets = [
          inAppWallet({
            smartAccount: {
              factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
              chain: polygon,
              gasless: true,
            }
          })
        ];

        setClient(thirdwebClient);
        setWallets(unicornWallets);
      } catch (error) {
        console.error('Failed to initialize Unicorn client:', error);
        setAutoConnectStatus('error');
      }
    };

    initializeUnicorn();
  }, []);

  const handleConnect = (wallet) => {
    console.log('🦄 Unicorn wallet auto-connected successfully');
    console.log('Wallet details:', {
      address: wallet.getAddress?.(),
      chain: wallet.getChain?.(),
    });
    
    setAutoConnectStatus('connected');
    setAutoConnectAttempted(true);

    // Store connection info for future reference
    try {
      localStorage.setItem('unicorn_connected', 'true');
      localStorage.setItem('last_wallet_connection', 'unicorn');
      localStorage.setItem('unicorn_connection_time', new Date().toISOString());
    } catch (e) {
      // localStorage might be blocked
    }

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('unicornConnected', { 
      detail: { wallet, timestamp: Date.now() } 
    }));
  };

  const handleError = (error) => {
    // Silent failure - don't show errors to user
    console.log('Unicorn auto-connect not available, manual connection still possible');
    console.debug('Auto-connect error details:', error);
    
    setAutoConnectStatus('failed');
    setAutoConnectAttempted(true);

    // Clear any stored connection info
    try {
      localStorage.removeItem('unicorn_connected');
    } catch (e) {
      // localStorage might be blocked
    }

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('unicornAutoConnectFailed', { 
      detail: { error: error.message, timestamp: Date.now() } 
    }));
  };

  // Don't render anything visible
  if (!client || !wallets.length || autoConnectAttempted) {
    return null;
  }

  return (
    <div style={{ display: 'none' }} data-unicorn-autoconnect={autoConnectStatus}>
      <AutoConnect
        client={client}
        wallets={wallets}
        timeout={3000} // Give up after 3 seconds
        onConnect={handleConnect}
        onError={handleError}
        accountAbstraction={{
          chain: polygon,
          sponsorGas: true,
        }}
      />
    </div>
  );
};

// Export a hook to check Unicorn connection status
export const useUnicornConnectionStatus = () => {
  const [status, setStatus] = useState('unknown');

  useEffect(() => {
    const checkStatus = () => {
      const element = document.querySelector('[data-unicorn-autoconnect]');
      if (element) {
        setStatus(element.dataset.unicornAutoconnect);
      }
    };

    // Check initial status
    checkStatus();

    // Listen for status changes
    const handleConnected = () => setStatus('connected');
    const handleFailed = () => setStatus('failed');

    window.addEventListener('unicornConnected', handleConnected);
    window.addEventListener('unicornAutoConnectFailed', handleFailed);

    return () => {
      window.removeEventListener('unicornConnected', handleConnected);
      window.removeEventListener('unicornAutoConnectFailed', handleFailed);
    };
  }, []);

  return status;
};

export default UnicornAutoConnect;