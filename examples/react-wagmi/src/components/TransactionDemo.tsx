import React from 'react';
import { 
  useAccount, 
  useSendTransaction, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { parseEther } from 'viem'; // A utility for converting ETH to wei

const TransactionDemoWagmi: React.FC = () => {
  // 1. Get account info from Wagmi's useAccount hook
  const { address, isConnected } = useAccount();

  // 2. Set up the hook to send a transaction
  const { 
    data: hash, // The transaction hash when successfully submitted
    error,      // An error object if the transaction fails
    isPending,  // True when the user's wallet is prompting for confirmation
    sendTransaction // The function to call to initiate the transaction
  } = useSendTransaction();

  // 3. Define the transaction logic
  const handleSendTransaction = () => {
    if (!address) return; // Guard clause
    
    // Call the sendTransaction function with the transaction details
    sendTransaction({
      to: address,         // Sending to our own address for this demo
      value: parseEther('0'), // Sending 0 ETH
      // data: '0x' is implied for a simple value transfer
    });
  };

  // 4. Set up a hook to wait for the transaction to be mined
  const { 
    isLoading: isConfirming, // True while waiting for the transaction to be confirmed on-chain
    isSuccess: isConfirmed,  // True once the transaction is confirmed
  } = useWaitForTransactionReceipt({
    hash, // This hook will automatically start listening once a hash is available
  });

  // Determine button state and text
  const canTransact = isConnected && address;
  const isProcessing = isPending || isConfirming;
  
  let buttonText = '🚀 Send Demo Transaction';
  if (isPending) buttonText = '⏳ Waiting for signature...';
  if (isConfirming) buttonText = '🔄 Confirming transaction...';

  return (
    <div>
      <h3>🔄 Transaction Demo</h3>
      
      <button 
        onClick={handleSendTransaction}
        disabled={!canTransact || isProcessing}
        style={{
          padding: '10px 20px',
          backgroundColor: canTransact && !isProcessing ? '#8b5cf6' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: canTransact && !isProcessing ? 'pointer' : 'not-allowed',
          minWidth: '240px', // To prevent layout shifts as text changes
        }}
      >
        {buttonText}
      </button>

      {/* Show the transaction hash as soon as it's available */}
      {hash && (
        <div style={{ background: '#e0e7ff', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
          <p>🔗 Transaction Sent: {hash.slice(0, 10)}...{hash.slice(-8)}</p>
          <a href={`https://polygonscan.com/tx/${hash}`} target="_blank" rel="noopener noreferrer">
            View on Polygonscan →
          </a>
        </div>
      )}
      
      {/* Show a confirmation message once the transaction is mined */}
      {isConfirmed && (
        <div style={{ background: '#d1fae5', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
          <p>✅ Success: Transaction has been confirmed!</p>
        </div>
      )}
      
      {/* Show an error message if anything goes wrong */}
      {error && (
        <div style={{ background: '#fee2e2', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
          {/* Wagmi provides a user-friendly `shortMessage` */}
          <p style={{ color: 'red' }}>❌ Error: {(error as any).shortMessage || error.message}</p>
        </div>
      )}
    </div>
  );
};

export default TransactionDemoWagmi;