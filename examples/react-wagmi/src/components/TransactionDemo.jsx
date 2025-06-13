import React, { useState } from 'react';
import { useUnicornAccount } from '../hooks/useUnicornAccount';
import { sendTransaction } from "thirdweb";

const TransactionDemo = () => {
  const { address, isConnected, provider, wallet } = useUnicornAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const sendDemoTransaction = async () => {
    console.log('🚀 Attempting to send REAL transaction...');
    console.log('Wallet object:', wallet);
    console.log('Wallet methods:', wallet ? Object.getOwnPropertyNames(Object.getPrototypeOf(wallet)) : 'no wallet');
    
    if (!address || !wallet) {
      setError('Wallet not connected properly');
      return;
    }

    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      // Method 1: Try calling getAccount properly
      console.log('📤 Getting account from wallet...');
      console.log('getAccount type:', typeof wallet.getAccount);
      
      let account;
      if (typeof wallet.getAccount === 'function') {
        account = await wallet.getAccount();
        console.log('✅ Got account:', account);
      } else {
        console.log('❌ getAccount is not a function, trying different approach...');
        
        // Try calling it as a property getter
        account = wallet.getAccount;
        console.log('Account as property:', account);
      }
      
      if (account) {
        // Prepare transaction
        const transaction = {
          to: address,
          value: 0n,
          data: '0x',
        };
        
        console.log('Sending transaction with account:', account);
        console.log('Transaction:', transaction);
        
        const result = await sendTransaction({
          transaction,
          account: account,
        });
        
        console.log('✅ Transaction result:', result);
        const hash = result.transactionHash || result;
        setTxHash(hash);
        
      } else {
        throw new Error('Could not get account from wallet');
      }
      
    } catch (thirdwebError) {
      console.log('❌ Thirdweb method failed:', thirdwebError);
      console.log('❌ Error details:', thirdwebError.message);
      
      // Method 2: Try using wallet methods directly
      try {
        console.log('📤 Trying direct wallet transaction methods...');
        console.log('Available wallet methods:', Object.getOwnPropertyNames(wallet));
        
        // Check if wallet has other transaction methods
        if (typeof wallet.sendTransaction === 'function') {
          console.log('✅ Wallet has sendTransaction method');
          
          const txResult = await wallet.sendTransaction({
            to: address,
            value: '0',
            data: '0x',
          });
          
          console.log('✅ Direct wallet transaction result:', txResult);
          setTxHash(txResult.hash || txResult);
          
        } else if (typeof wallet.execute === 'function') {
          console.log('✅ Wallet has execute method');
          
          const txResult = await wallet.execute({
            to: address,
            value: 0,
            data: '0x',
          });
          
          console.log('✅ Execute result:', txResult);
          setTxHash(txResult.hash || txResult);
          
        } else {
          console.log('❌ No known transaction methods found');
          throw new Error('No transaction methods available on wallet');
        }
        
      } catch (directError) {
        console.error('❌ Direct wallet method also failed:', directError);
        setError(`All transaction methods failed. Thirdweb: ${thirdwebError.message}, Direct: ${directError.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const canTransact = isConnected && address && wallet;

  return (
    <div>
      <h3>🔄 Transaction Demo</h3>
      
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '10px', fontSize: '12px' }}>
        <strong>Debug Info:</strong><br/>
        Connected: {isConnected ? '✅' : '❌'}<br/>
        Address: {address ? '✅' : '❌'}<br/>
        Wallet: {wallet ? '✅' : '❌'}<br/>
        Provider: {provider ? '✅' : '❌'}<br/>
        Can Transact: {canTransact ? '✅' : '❌'}
      </div>
      
      <button 
        onClick={sendDemoTransaction}
        disabled={!canTransact || isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: canTransact && !isLoading ? '#8b5cf6' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: canTransact && !isLoading ? 'pointer' : 'not-allowed'
        }}
      >
        {isLoading ? '⏳ Processing...' : '🚀 Send REAL Demo Transaction'}
      </button>
      
      {txHash && (
        <div style={{ background: '#d1fae5', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
          <p>✅ Success: {txHash.slice(0, 10)}...{txHash.slice(-8)}</p>
          <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
            View on Polygonscan →
          </a>
        </div>
      )}
      
      {error && (
        <div style={{ background: '#fee2e2', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
          <p style={{ color: 'red' }}>❌ {error}</p>
          <button onClick={() => setError('')} style={{ marginTop: '5px' }}>
            Clear Error
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionDemo;