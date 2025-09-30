// TransactionDemo.jsx - Show how to use the connected Unicorn wallet
import React, { useState } from 'react';
import { useAccount } from 'wagmi';

const TransactionDemo = ({ unicornWallet, unicornAddress }) => {
  const { isConnected: isWagmiConnected } = useAccount();
  const [txResult, setTxResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo transaction using Unicorn wallet
  const sendUnicornTransaction = async () => {
    if (!unicornWallet) {
      setTxResult('❌ No Unicorn wallet available');
      return;
    }

    setIsLoading(true);
    setTxResult('');

    try {
      // Example: Send a simple transaction (0 value to self)
      // In a real dApp, this would be a contract interaction
      const tx = {
        to: unicornAddress,
        value: '0',
        data: '0x',
      };

      console.log('🦄 Sending transaction via Unicorn wallet:', tx);
      
      // For demo purposes - in real implementation you'd use:
      // const result = await unicornWallet.sendTransaction(tx);
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTxResult(`✅ Transaction sent successfully! (Demo)`);
      console.log('🦄 Transaction completed');
      
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      setTxResult(`❌ Transaction failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!unicornAddress && !isWagmiConnected) {
    return (
      <div style={{ 
        background: '#f3f4f6', 
        padding: '20px', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p>Connect a wallet to test transactions</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'white', 
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '20px'
    }}>
      <h3>🔄 Transaction Demo</h3>
      
      {unicornAddress && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <p><strong>🦄 Unicorn Wallet Active</strong></p>
            <p style={{ fontSize: '12px', color: '#0c4a6e', fontFamily: 'monospace' }}>
              {unicornAddress}
            </p>
            <p style={{ fontSize: '12px', color: '#0c4a6e' }}>
              ⚡ Gasless transactions enabled
            </p>
          </div>
          
          <button
            onClick={sendUnicornTransaction}
            disabled={isLoading}
            style={{
              background: isLoading ? '#9ca3af' : '#8b5cf6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {isLoading ? '⏳ Sending...' : '🦄 Send Demo Transaction (Gasless)'}
          </button>
        </div>
      )}

      {isWagmiConnected && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <p><strong>👛 Standard Wallet Connected</strong></p>
            <p style={{ fontSize: '12px', color: '#92400e' }}>
              Use your normal wallet transaction flow
            </p>
          </div>
          
          <button
            disabled={true}
            style={{
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'not-allowed',
              fontSize: '14px',
              fontWeight: '600',
              opacity: 0.7
            }}
          >
            💸 Standard Transaction (Gas Required)
          </button>
        </div>
      )}

      {txResult && (
        <div style={{
          background: txResult.includes('✅') ? '#d1fae5' : '#fee2e2',
          border: `1px solid ${txResult.includes('✅') ? '#10b981' : '#ef4444'}`,
          borderRadius: '6px',
          padding: '12px',
          marginTop: '16px'
        }}>
          <p style={{ 
            color: txResult.includes('✅') ? '#065f46' : '#991b1b',
            margin: 0,
            fontSize: '14px'
          }}>
            {txResult}
          </p>
        </div>
      )}
      
      <div style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '12px',
        marginTop: '16px',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <p style={{ margin: '0 0 8px 0' }}><strong>💡 Integration Notes:</strong></p>
        <ul style={{ margin: 0, paddingLeft: '16px' }}>
          <li>Unicorn wallet provides gasless transactions</li>
          <li>Use the wallet object for contract interactions</li>
          <li>Standard wallets work with your existing transaction flow</li>
          <li>Both can coexist - user chooses their preferred experience</li>
        </ul>
      </div>
    </div>
  );
};

export default TransactionDemo;