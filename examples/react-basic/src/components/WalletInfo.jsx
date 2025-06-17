import React from 'react';
import { useUnicornWallet } from '../hooks/useUnicornWallet';

const WalletInfo = () => {
  const { account, wallet, address, chainName, disconnect } = useUnicornWallet();

  if (!account || !wallet) {
    return null;
  }

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="wallet-info-card">
      <div className="card-header">
        <h3>🦄 Wallet Connected</h3>
        <button 
          onClick={disconnect}
          className="disconnect-btn"
          title="Disconnect wallet"
        >
          ⏏️
        </button>
      </div>
      
      <div className="wallet-details">
        <div className="detail-row">
          <span className="label">Address:</span>
          <span className="value address-value" title={address}>
            {formatAddress(address)}
          </span>
        </div>
        
        <div className="detail-row">
          <span className="label">Network:</span>
          <span className="value">{chainName || 'Unknown'}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Type:</span>
          <span className="value">Smart Account</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Gas:</span>
          <span className="value gasless-indicator">
            <span className="status-dot"></span>
            Sponsored
          </span>
        </div>
      </div>
      
      <div className="connection-status">
        <span className="status-indicator connected">
          <span className="pulse-dot"></span>
          Connected & Ready
        </span>
      </div>
    </div>
  );
};

export default WalletInfo;