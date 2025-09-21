// src/components/WalletInfo.jsx
import React from 'react';
import { useAccount, useBalance } from 'wagmi';

function WalletInfo() {
  const { address, isConnected, connector } = useAccount();
  const { data: balance } = useBalance({ address });

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
          Use the Connect Wallet button above
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3>👛 Wallet Information</h3>
      <div style={{ marginTop: '15px' }}>
        <p><strong>Status:</strong> ✅ Connected</p>
        <p><strong>Wallet:</strong> {connector?.name || 'Unknown'}</p>
        <p><strong>Address:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}</p>
        {balance && (
          <p><strong>Balance:</strong> {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}</p>
        )}
      </div>
    </div>
  );
}

export default WalletInfo;