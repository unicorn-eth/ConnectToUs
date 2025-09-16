// hooks/useSmartAutoConnect.js
// Coded lovingly by @cryptowampum and Claude AI

import { useEffect, useState } from 'react';
import { useConnect, useAccount } from 'wagmi';

export const useSmartAutoConnect = () => {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);

  useEffect(() => {
    // Only try auto-connect if:
    // 1. Not already connected
    // 2. Haven't attempted yet
    // 3. In Unicorn environment
    if (!isConnected && !autoConnectAttempted) {
      const attemptAutoConnect = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const walletId = urlParams.get('walletId');
        const authCookie = urlParams.get('authCookie');
        
        if (walletId === 'inApp' && authCookie) {
          try {
            // Find the Unicorn connector
            const unicornConnector = connectors.find(c => c.name === 'Unicorn.eth');
            
            if (unicornConnector) {
              // Try to connect silently
              await connect({ 
                connector: unicornConnector,
                // Don't show errors to user
                silent: true 
              });
            }
          } catch (error) {
            // Silently fail - user can still connect manually
            console.log('Auto-connect not available, manual connection ready');
          }
        }
        
        setAutoConnectAttempted(true);
      };

      attemptAutoConnect();
    }
  }, [isConnected, autoConnectAttempted, connect, connectors]);

  return { autoConnectAttempted };
};