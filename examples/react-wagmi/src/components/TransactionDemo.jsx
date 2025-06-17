import React, { useState } from 'react';
import { useUnicornAccount } from '../hooks/useUnicornAccount';

const TransactionDemo = () => {
  const { address, isConnected, provider } = useUnicornAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const sendDemoTransaction = async () => {
    if (!address || !provider) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: address,
          value: '0x0',
          data: '0x'
        }],
      });

      setTxHash(hash);
      console.log('✅ Transaction hash:', hash);
    } catch (err) {
      console.error('❌ Transaction failed:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const canTransact = isConnected && address && provider;

  return (
    <div>
      <h3>🔄 Transaction Demo</h3>
      
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
        {isLoading ? '⏳ Processing...' : '🚀 Send Demo Transaction'}
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
        </div>
      )}
    </div>
  );
};

export default TransactionDemo;