// src/components/ExistingAppContent.jsx - Example of existing dApp functionality
// Coded lovingly by @cryptowampum and Claude AI
// This shows how your existing app components work with both wallet types

import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { useUniversalWallet } from '../hooks/useUniversalWallet';

// Main content component showing unified wallet integration
function ExistingAppContent() {
  // Replace useAccount with useUniversalWallet - now supports both Wagmi and Unicorn!
  const wallet = useUniversalWallet();
  
  // Transaction hook for standard wallets
  const { sendTransaction, isPending, data: hash, error } = useSendTransaction();
  
  return (
    <div className="content">
      <h2>Your Existing dApp</h2>
      
      {/* Wallet status display - works with both wallet types */}
      <WalletStatusCard wallet={wallet} />

      {/* Your existing app functionality - enhanced for both wallet types */}
      <ExistingAppFeatures 
        wallet={wallet} 
        sendTransaction={sendTransaction}
        isPending={isPending}
        hash={hash}
        error={error}
      />

      {/* Smart wallet connection controls */}
      <WalletConnectionControls wallet={wallet} />

      {/* Integration information */}
      <IntegrationInfo />
    </div>
  );
}

// Wallet status display component
function WalletStatusCard({ wallet }) {
  return (
    <div className="status-card">
      <h3>Wallet Status</h3>
      {wallet.isConnected ? (
        <div>
          <p>✅ Connected via {wallet.connector?.name}</p>
          <p>Address: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}</p>
          {wallet.isUnicorn && (
            <p style={{ color: '#8b5cf6', fontSize: '14px' }}>⚡ Gasless transactions enabled</p>
          )}
        </div>
      ) : (
        <p>⚪ Not connected</p>
      )}
    </div>
  );
}

// Example of existing app functionality that now works with both wallet types
function ExistingAppFeatures({ wallet, sendTransaction, isPending, hash, error }) {
  const [txStatus, setTxStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExistingAppAction = async () => {
    if (!wallet.isConnected) {
      setTxStatus('❌ Please connect a wallet first');
      return;
    }

    setIsLoading(true);
    setTxStatus('');

    try {
      console.log('🔄 Executing existing app functionality...');
      console.log('Using wallet:', wallet.connector?.name);
      console.log('Address:', wallet.address);
      console.log('Is gasless?', wallet.isUnicorn);

      if (wallet.isUnicorn) {
        // Unicorn wallet - simulated for demo (real implementation would use Thirdweb)
        console.log('🦄 Using Unicorn wallet for gasless transaction');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setTxStatus('✅ Gasless transaction completed! (Demo - in real app this would be a real Thirdweb transaction)');
        
      } else if (wallet.isStandard) {
        // Standard wallet - REAL transaction using Wagmi
        console.log('💸 Using standard wallet - will request approval and send real transaction');
        
        try {
          // Send a real transaction - small amount to self
          await sendTransaction({
            to: wallet.address,
            value: parseEther('0.001'), // 0.001 ETH
            data: '0x', // Simple transfer
          });
          
          setTxStatus('✅ Real transaction submitted! Check your wallet and blockchain explorer.');
          
        } catch (txError) {
          if (txError.message.includes('User rejected')) {
            setTxStatus('❌ Transaction rejected by user');
          } else {
            setTxStatus(`❌ Transaction failed: ${txError.message}`);
          }
        }
      }

    } catch (error) {
      setTxStatus(`❌ Action failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle transaction success
  useEffect(() => {
    if (hash) {
      setTxStatus(`✅ Transaction successful! Hash: ${hash.slice(0, 10)}...${hash.slice(-8)}`);
      setIsLoading(false);
    }
  }, [hash]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      setTxStatus(`❌ Transaction failed: ${error.message}`);
      setIsLoading(false);
    }
  }, [error]);

  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '20px'
    }}>
      <h3>🎯 Your Existing App Functionality</h3>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
        This represents your existing dApp features - they work with both wallet types!
      </p>
      
      <button
        onClick={handleExistingAppAction}
        disabled={!wallet.isConnected || isLoading || isPending}
        style={{
          background: wallet.isConnected ? (wallet.isUnicorn ? '#8b5cf6' : '#0ea5e9') : '#94a3b8',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: wallet.isConnected && !isLoading && !isPending ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: '600'
        }}
      >
        {isLoading || isPending ? '⏳ Processing...' : (
          wallet.isUnicorn ? '🦄 Execute Action (Gasless Demo)' : 
          wallet.isStandard ? '💸 Execute Action (Real Transaction - 0.001 ETH)' :
          'Connect Wallet to Continue'
        )}
      </button>

      {/* Show transaction hash with link to explorer */}
      {hash && (
        <div style={{
          background: '#dcfce7',
          border: '1px solid #16a34a',
          borderRadius: '6px',
          padding: '12px',
          marginTop: '12px'
        }}>
          <p style={{ color: '#166534', margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
            ✅ Transaction Successful!
          </p>
          <p style={{ color: '#166534', margin: '0 0 8px 0', fontSize: '12px', fontFamily: 'monospace' }}>
            Hash: {hash}
          </p>
          <a 
            href={`https://etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0ea5e9', fontSize: '12px', textDecoration: 'underline' }}
          >
            View on Etherscan →
          </a>
        </div>
      )}

      {txStatus && !hash && (
        <div style={{
          background: txStatus.includes('✅') ? '#dcfce7' : '#fee2e2',
          border: `1px solid ${txStatus.includes('✅') ? '#16a34a' : '#dc2626'}`,
          borderRadius: '6px',
          padding: '12px',
          marginTop: '12px'
        }}>
          <p style={{ 
            color: txStatus.includes('✅') ? '#166534' : '#991b1b',
            margin: 0,
            fontSize: '14px'
          }}>
            {txStatus}
          </p>
        </div>
      )}

      <div style={{
        background: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '6px',
        padding: '12px',
        marginTop: '12px',
        fontSize: '12px',
        color: '#92400e'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>💡 Integration Demo:</p>
        <ul style={{ margin: 0, paddingLeft: '16px' }}>
          <li><strong>Unicorn:</strong> Simulated gasless transaction (demo only)</li>
          <li><strong>MetaMask/Standard:</strong> Real transaction requiring approval and gas</li>
          <li><strong>Same code path</strong> - your app doesn't need to know the difference!</li>
        </ul>
      </div>
    </div>
  );
}

// Wallet connection controls
function WalletConnectionControls({ wallet }) {
  return (
    <div>
      {/* No wallet connected */}
      {!wallet.isConnected && (
        <div style={{ marginTop: '20px' }}>
          <ConnectButton />
        </div>
      )}

      {/* Unicorn wallet connected */}
      {wallet.isUnicorn && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ 
            display: 'flex',
            gap: '10px',
            justifyContent: 'center'
          }}>
            <button 
              onClick={() => wallet.disconnect()}
              style={{
                background: 'white',
                border: '2px solid #8b5cf6',
                color: '#8b5cf6',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Disconnect Unicorn
            </button>
            <ConnectButton />
          </div>
        </div>
      )}

      {/* Standard wallet connected */}
      {wallet.isStandard && (
        <div style={{ marginTop: '20px' }}>
          <ConnectButton />
        </div>
      )}
    </div>
  );
}

// Integration information
function IntegrationInfo() {
  return (
    <div className="info-section">
      <h2>How This Integration Works</h2>
      <p>This dApp demonstrates adding Unicorn AutoConnect to an existing application:</p>
      
      <div className="integration-steps">
        <h3>Key Integration Benefits:</h3>
        <ol>
          <li><strong>Zero Breaking Changes:</strong> Existing app code works with both wallet types</li>
          <li><strong>Unified Interface:</strong> <code>useUniversalWallet()</code> replaces <code>useAccount()</code></li>
          <li><strong>Automatic Enhancement:</strong> Unicorn users get gasless transactions automatically</li>
          <li><strong>User Choice:</strong> Users can switch between Unicorn and standard wallets</li>
        </ol>
        
        <p style={{ marginTop: '15px' }}>
          <strong>What changed in existing code:</strong> Replace <code>useAccount()</code> with <code>useUniversalWallet()</code> - that's it!
        </p>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px' }}>
        <h3>🧪 Test the Integration:</h3>
        <p><strong>Normal mode:</strong> <code>{window.location.origin}</code></p>
        <p><strong>Unicorn mode:</strong> <code>{window.location.origin}/?walletId=inApp&authCookie=test</code></p>
      </div>
    </div>
  );
}

export default ExistingAppContent;