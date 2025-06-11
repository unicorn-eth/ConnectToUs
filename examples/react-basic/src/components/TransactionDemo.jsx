import React, { useState } from 'react';
import { prepareContractCall, sendTransaction, getContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { client } from '../utils/unicornConfig';
import { polygon } from "thirdweb/chains";

// Example contract - USDC on Polygon for balance checking
const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

const TransactionDemo = () => {
  const account = useActiveAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [balance, setBalance] = useState('');

  const checkBalance = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const contract = getContract({
        client,
        chain: polygon,
        address: USDC_ADDRESS,
      });

      // Read balance (no transaction needed)
      const balanceResult = await contract.read("balanceOf", [account.address]);
      const formattedBalance = (Number(balanceResult) / 1e6).toFixed(2); // USDC has 6 decimals
      setBalance(formattedBalance);
    } catch (err) {
      console.error("❌ Balance check failed:", err);
      setError(err.message || 'Failed to check balance');
    } finally {
      setIsLoading(false);
    }
  };

  const sendDemoTransaction = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      const contract = getContract({
        client,
        chain: polygon,
        address: USDC_ADDRESS,
      });

      // Prepare a simple approve transaction (0 amount, safe)
      const transaction = prepareContractCall({
        contract,
        method: "approve",
        params: [account.address, 0], // Approve 0 tokens to self (safe demo)
      });

      // Send the gasless transaction
      const result = await sendTransaction({
        transaction,
        account,
      });

      setTxHash(result.transactionHash);
      console.log("✅ Demo transaction successful:", result);
    } catch (err) {
      console.error("❌ Transaction failed:", err);
      if (err.message.includes("user rejected")) {
        setError('Transaction was cancelled');
      } else if (err.message.includes("insufficient funds")) {
        setError('Gasless sponsorship failed - please contact support');
      } else {
        setError(err.message || 'Transaction failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="transaction-demo-card">
      <div className="card-header">
        <h3>🔄 Transaction Demo</h3>
        <p>Test your Unicorn wallet with gasless transactions</p>
      </div>

      <div className="demo-actions">
        <button 
          onClick={checkBalance}
          disabled={!account || isLoading}
          className="demo-button secondary"
        >
          {isLoading && balance === '' ? '⏳ Checking...' : '💰 Check USDC Balance'}
        </button>

        {balance && (
          <div className="balance-display">
            <span className="balance-label">USDC Balance:</span>
            <span className="balance-amount">{balance} USDC</span>
          </div>
        )}

        <button 
          onClick={sendDemoTransaction}
          disabled={!account || isLoading}
          className="demo-button primary"
        >
          {isLoading && !balance ? '⏳ Processing...' : '🚀 Send Demo Transaction'}
        </button>

        <p className="demo-note">
          ℹ️ This demo sends a safe, gasless transaction to test your integration
        </p>
      </div>

      {txHash && (
        <div className="success-message">
          <h4>✅ Transaction Successful!</h4>
          <div className="tx-details">
            <span className="tx-label">Hash:</span>
            <span className="tx-hash" title={txHash}>
              {`${txHash.slice(0, 10)}...${txHash.slice(-8)}`}
            </span>
          </div>
          <a 
            href={`https://polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
          >
            View on Polygonscan →
          </a>
        </div>
      )}

      {error && (
        <div className="error-message">
          <h4>❌ Error</h4>
          <p>{error}</p>
          <button 
            onClick={() => setError('')}
            className="close-error-btn"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionDemo;