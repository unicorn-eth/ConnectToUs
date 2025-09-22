// Coded lovingly by @cryptowampum and Claude AI
// src/components/WalletInfo.jsx - WITH UNICORN CONTEXT
import React from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useUnicorn } from '../context/UnicornContext';

function WalletInfo() {
  // Wagmi/RainbowKit connection
  const wagmiAccount = useAccount();
  
  // Unicorn connection from context
  const { unicornAddress, isUnicornConnected } = useUnicorn();
  
  // Check both connections
  const isConnected = wagmiAccount.isConnected || isUnicornConnected;
  const address = wagmiAccount.address || unicornAddress;
  const connector = wagmiAccount.connector?.name || (isUnicornConnected ? 'Unicorn Smart Account' : null);
  
  // Get balance for the connected address
  const { data: balance } = useBalance({ 
    address: address,
    enabled: !!address 
  });

  if (!isConnected) {
    return (
      <div style={{
        padding: '20px',
        background: '#fef3c7',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p>👛 No wallet connected</p>
        <p style={{ fontSize: '14px', color: '#92400e' }}>
          Use the Connect Wallet button above or wait for AutoConnect
        </p>
      </div>
    );
  }

  // Determine wallet type
  const isUnicornWallet = isUnicornConnected;
  const walletIcon = isUnicornWallet ? '🦄' : '👛';
  const walletType = isUnicornWallet ? 'Smart Account (AA)' : 'EOA Wallet';

  return (
    <div style={{
      padding: '20px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3>{walletIcon} Wallet Information</h3>
      <div style={{ marginTop: '15px' }}>
        <p><strong>Status:</strong> ✅ Connected</p>
        <p><strong>Wallet:</strong> {connector}</p>
        <p><strong>Type:</strong> {walletType}</p>
        <p><strong>Address:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}</p>
        <p><strong>Full Address:</strong> <code style={{ fontSize: '11px', wordBreak: 'break-all' }}>{address}</code></p>
        {balance && (
          <p><strong>Balance:</strong> {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}</p>
        )}
        
        {isUnicornWallet && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
            borderRadius: '6px',
            border: '1px solid #8b5cf6'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#7c3aed' }}>
              <strong>🦄 Unicorn Features:</strong> Gasless • Multi-sig • Session Keys • AutoConnected
            </p>
          </div>
        )}
        
        {/* Debug info */}
        <div style={{
          marginTop: '10px',
          padding: '5px',
          background: '#f3f4f6',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <div>Wagmi Connected: {wagmiAccount.isConnected ? '✓' : '✗'}</div>
          <div>Unicorn Connected: {isUnicornConnected ? '✓' : '✗'}</div>
          <div>Connection Type: {isUnicornWallet ? 'Thirdweb' : 'RainbowKit'}</div>
        </div>
      </div>
    </div>
  );
}

export default WalletInfo;