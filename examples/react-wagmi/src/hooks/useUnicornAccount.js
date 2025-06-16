import { useState, useEffect } from 'react';
import { autoConnect } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";
import { thirdwebClient, UNICORN_FACTORY_ADDRESS } from '../config/wagmi';

export const useUnicornAccount = () => {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);

  const connectUnicornWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      console.log('🦄 Starting connection...');
      
      let capturedWallet = null;
      
      const result = await autoConnect({
        client: thirdwebClient,
        accountAbstraction: {
          chain: polygon,
          sponsorGas: true,
          factoryAddress: UNICORN_FACTORY_ADDRESS,
        },
  onConnect: async (connectedWallet) => {
    console.log('🎉 onConnect callback triggered with wallet:', connectedWallet);
    
    // Update state immediately in the callback
    setWallet(connectedWallet);
    setIsConnected(true);
    
    try {
      // Get the real address
      if (typeof connectedWallet.getAccount === 'function') {
        const account = await connectedWallet.getAccount();
        console.log('📋 Account from onConnect:', account);
        
        const realAddress = account?.address || account;
        console.log('📍 Real address from onConnect:', realAddress);
        
        if (realAddress && realAddress.startsWith('0x')) {
          setAddress(realAddress);
          console.log('✅ Address updated via onConnect:', realAddress);
        }
      }
      
      // Create the provider in the callback too
      const provider = {
        request: async ({ method, params }) => {
          console.log('🔗 Provider request:', method, params);
          
          if (method === 'eth_accounts') {
            const currentAccount = await connectedWallet.getAccount();
            const currentAddress = currentAccount?.address || currentAccount;
            return [currentAddress];
          }
          
          if (method === 'eth_sendTransaction') {
            console.log('📤 REAL Transaction via onConnect wallet:', params[0]);
            
            try {
              const { sendTransaction } = await import("thirdweb");
              const account = await connectedWallet.getAccount();
              
              const transaction = {
                to: params[0].to,
                value: BigInt(params[0].value || 0),
                data: params[0].data || '0x',
              };
              
              console.log('📤 Sending real transaction...');
              const result = await sendTransaction({
                transaction,
                account,
              });
              
              const hash = result.transactionHash || result;
              console.log('🎉 REAL transaction hash:', hash);
              return hash;
              
            } catch (txError) {
              console.error('❌ Real transaction failed:', txError);
              throw txError;
            }
          }
          
          if (method === 'eth_chainId') {
            return '0x89';
          }
          
          throw new Error(`Method ${method} not supported`);
        }
      };
      
      setProvider(provider);
      console.log('✅ Provider updated via onConnect');
      
    } catch (callbackError) {
      console.error('❌ Error in onConnect callback:', callbackError);
    } finally {
      setIsConnecting(false);
    }
  },
  onDisconnect: async (disconnectedWallet) => {
    console.log('👋 onDisconnect callback triggered with wallet:', disconnectedWallet);
    
    // Update state immediately in the callback
    setWallet(null);
    setIsConnected(false);
    
    setIsConnecting(false);
  },
  onError: (error) => {
    console.error('❌ AutoConnect error:', error);
    setError(error);
    setIsConnecting(false);
  },
      });

      console.log('📊 AutoConnect returned:', result);

      if (result === true || capturedWallet) {
        setWallet(capturedWallet );
        setIsConnected(true);
        
         if (capturedWallet) {
          // Get the real address - NO fallback to your actual address
          console.log('✅ Captured wallet:', capturedWallet);
          try {
            if (typeof capturedWallet.getAccount === 'function') {
              const account = await capturedWallet.getAccount();
              console.log('📋 Raw account from wallet:', account);
              
              const realAddress = account?.address || account;
              console.log('📍 Extracted address:', realAddress);
              
              if (realAddress && realAddress.startsWith('0x')) {
                setAddress(realAddress);
                console.log('✅ Real address set from wallet:', realAddress);
              } else {
                console.log('❌ No valid address found in wallet');
                // Use a DIFFERENT dummy address to make it obvious when wallet retrieval fails
                setAddress('0x0000000000000000000000000000000000000000');
              }
            } else {
              console.log('❌ getAccount is not a function');
              setAddress('0x1111111111111111111111111111111111111111'); // Different dummy
            }
          } catch (e) {
            console.log('❌ getAccount failed:', e.message);
            setAddress('0x2222222222222222222222222222222222222222'); // Different dummy
          }
        } else {
          console.log('❌ capturedWallet is null:',capturedWallet);
          setAddress('0x3333333333333333333333333333333333333333'); // Different dummy
        }
        
        
        // Create simple working provider (same as before that worked)
        const provider = {
          request: async ({ method, params }) => {
            console.log('🔗 Provider request:', method, params);
            
            if (method === 'eth_accounts') {
              return [address || '0x4333333333333333333333333333333333333333'];
            }
            
            if (method === 'eth_sendTransaction') {
              console.log('📤 Transaction request:', params[0]);
              // Return dummy hash for now
              return '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
            }
            
            if (method === 'eth_chainId') {
              return '0x89';
            }
            
            throw new Error(`Method ${method} not supported`);
          }
        };
        
        setProvider(provider);
        console.log('✅ Provider created');
        
      } else {
        throw new Error('AutoConnect failed');
      }
      
    } catch (err) {
      console.error('❌ Connection error:', err);
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      if (wallet && typeof wallet.disconnect === 'function') {
        await wallet.disconnect();
      }
    } catch (err) {
      console.error('Disconnect error:', err);
    } finally {
      setWallet(null);
      setProvider(null);
      setAddress(null);
      setIsConnected(false);
      setError(null);
    }
  };

  useEffect(() => {
    connectUnicornWallet();
  }, []);

  return {
    wallet, 
    provider, 
    address, 
    isConnected, 
    isConnecting, 
    error,
    formattedAddress: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '',
    connectUnicornWallet, 
    disconnect
  };
};