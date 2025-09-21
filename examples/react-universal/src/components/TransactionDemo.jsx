// Coded lovingly by @cryptowampum and Claude AI
// components/TransactionDemo.jsx
import React, { useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { polygon } from 'wagmi/chains';

const TransactionDemo = () => {
  const { address, isConnected, connector } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [txHash, setTxHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(null);
  
  // Check if this is a Unicorn wallet
  const isUnicornWallet = connector?.id === 'unicorn' || 
    connector?.name === 'Unicorn.eth' ||
    window.location.search.includes('walletId=inApp');

  // Check balance
  const checkBalance = async () => {
    if (!address || !publicClient) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const bal = await publicClient.getBalance({ address });
      setBalance(formatEther(bal));
    } catch (err) {
      console.error('Failed to get balance:', err);
      setError('Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  // Send demo transaction
  const sendDemoTransaction = async () => {
    if (!address || !walletClient) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      // Simple self-transfer of 0 ETH as a demo
      const hash = await walletClient.sendTransaction({
        to: address,
        value: parseEther('0'),
        chain: polygon,
      });

      setTxHash(hash);
      console.log('Transaction sent:', hash);

      // Wait for confirmation if needed
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('Transaction confirmed:', receipt);
      }
    } catch (err) {
      console.error('Transaction failed:', err);
      if (err.message.includes('rejected')) {
        setError('Transaction was rejected by user');
      } else if (err.message.includes('insufficient')) {
        setError('Insufficient funds for gas');
      } else {
        setError(err.message || 'Transaction failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Send gasless transaction (Unicorn only)
  const sendGaslessTransaction = async () => {
    if (!isUnicornWallet) {
      setError('Gasless transactions are only available for Unicorn wallets');
      return;
    }

    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      // For Unicorn wallets, transactions are automatically gasless
      const hash = await walletClient.sendTransaction({
        to: address,
        value: parseEther('0'),
        chain: polygon,
        // Gas is sponsored automatically for Unicorn wallets
      });

      setTxHash(hash);
      console.log('Gasless transaction sent:', hash);
    } catch (err) {
      console.error('Gasless transaction failed:', err);
      setError(err.message || 'Gasless transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="transaction-demo">
        <h3>🔄 Transaction Demo</h3>
        <p>Connect your wallet to test transactions</p>
      </div>
    );
  }

  return (
    <div className="transaction-demo">
      <h3>🔄 Transaction Demo</h3>
      
      <div className="wallet-info-mini">
        <p>
          <strong>Connected:</strong> {address.slice(0, 6)}...{address.slice(-4)}
        </p>
        <p>
          <strong>Wallet:</strong> {connector?.name || 'Unknown'}
          {isUnicornWallet && ' 🦄'}
        </p>
        {balance !== null && (
          <p>
            <strong>Balance:</strong> {parseFloat(balance).toFixed(4)} MATIC
          </p>
        )}
      </div>

      <div className="demo-actions">
        <button
          onClick={checkBalance}
          disabled={isLoading}
          className="demo-button secondary"
        >
          {isLoading ? '⏳ Loading...' : '💰 Check Balance'}
        </button>

        <button
          onClick={sendDemoTransaction}
          disabled={isLoading}
          className="demo-button primary"
        >
          {isLoading ? '⏳ Processing...' : '📤 Send Demo Transaction'}
        </button>

        {isUnicornWallet && (
          <button
            onClick={sendGaslessTransaction}
            disabled={isLoading}
            className="demo-button unicorn"
          >
            {isLoading ? '⏳ Processing...' : '⚡ Send Gasless Transaction'}
          </button>
        )}
      </div>

      {txHash && (
        <div className="success-message">
          <h4>✅ Transaction Successful!</h4>
          <p>Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}</p>
          <a 
            href={`https://polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#8b5cf6', textDecoration: 'underline' }}
          >
            View on Polygonscan →
          </a>
        </div>
      )}

      {error && (
        <div className="error-message">
          <h4>❌ Error</h4>
          <p>{error}</p>
        </div>
      )}

      <div className="demo-info" style={{ marginTop: '20px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
        <h4>ℹ️ About This Demo</h4>
        <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '14px', color: '#4b5563' }}>
          <li>Tests basic transaction sending with your connected wallet</li>
          <li>Shows balance checking functionality</li>
          {isUnicornWallet ? (
            <li>✨ Gasless transactions enabled (Unicorn exclusive)</li>
          ) : (
            <li>Connect with Unicorn wallet for gasless transactions</li>
          )}
          <li>Works with all supported wallets</li>
        </ul>
      </div>
    </div>
  );
};

export default TransactionDemo;