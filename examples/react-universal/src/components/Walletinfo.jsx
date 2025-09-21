
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


// components/WalletInfo.jsx
// Coded lovingly by @cryptowampum and Claude AI
// components/WalletInfo.jsx
/* import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useNetwork, useEnsName, useEnsAvatar } from 'wagmi';

const WalletInfo = () => {
  const { address, connector, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { data: balance } = useBalance({ 
    address,
    watch: true, // Auto-update balance
  });
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName });
  
  const [copied, setCopied] = useState(false);
  const [isUnicornWallet, setIsUnicornWallet] = useState(false);

  useEffect(() => {
    // Check if this is a Unicorn wallet
    const checkUnicorn = 
      connector?.id === 'unicorn' || 
      connector?.name === 'Unicorn.eth' ||
      window.location.search.includes('walletId=inApp');
    
    setIsUnicornWallet(checkUnicorn);
  }, [connector]);

  if (!isConnected || !address) {
    return (
      <div className="wallet-info">
        <h3>👛 Wallet Info</h3>
        <p style={{ color: '#6b7280' }}>No wallet connected</p>
      </div>
    );
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getWalletIcon = () => {
    if (isUnicornWallet) return '🦄';
    const name = connector?.name?.toLowerCase() || '';
    if (name.includes('metamask')) return '🦊';
    if (name.includes('walletconnect')) return '🔗';
    if (name.includes('coinbase')) return '💰';
    if (name.includes('rainbow')) return '🌈';
    if (name.includes('safe')) return '🔒';
    if (name.includes('trust')) return '💎';
    if (name.includes('argent')) return '🛡️';
    return '👛';
  };

  const getWalletType = () => {
    if (isUnicornWallet) return 'Smart Account (AA)';
    if (connector?.name?.includes('Safe')) return 'Smart Account (Safe)';
    return 'EOA Wallet';
  };

  const getNetworkColor = () => {
    const chainId = chain?.id;
    const colors = {
      1: '#627eea',     // Ethereum - blue
      137: '#8247e5',   // Polygon - purple
      42161: '#28a0f0', // Arbitrum - blue
      10: '#ff0420',    // Optimism - red
      8453: '#0052ff',  // Base - blue
    };
    return colors[chainId] || '#6b7280';
  };

  return (
    <div className="wallet-info">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <span style={{ fontSize: '24px' }}>{getWalletIcon()}</span>
        <h3 style={{ margin: 0 }}>Wallet Info</h3>
      </div>

      {ensAvatar && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img 
            src={ensAvatar} 
            alt="ENS Avatar" 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%',
              border: '3px solid #e5e7eb'
            }} 
          />
        </div>
      )}

      <div className="wallet-details">
        <div className="wallet-detail">
          <label>Address</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span title={address}>
              {ensName || formatAddress(address)}
            </span>
            <button
              onClick={copyAddress}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
              }}
              title="Copy address"
            >
              {copied ? '✅' : '📋'}
            </button>
          </div>
        </div>

        <div className="wallet-detail">
          <label>Wallet</label>
          <span>{connector?.name || 'Unknown'}</span>
        </div>

        <div className="wallet-detail">
          <label>Type</label>
          <span>{getWalletType()}</span>
        </div>

        <div className="wallet-detail">
          <label>Network</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span 
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: getNetworkColor(),
              }}
            />
            <span>{chain?.name || 'Unknown'}</span>
          </div>
        </div>

        <div className="wallet-detail">
          <label>Balance</label>
          <span>
            {balance ? 
              `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 
              'Loading...'
            }
          </span>
        </div>

        {isUnicornWallet && (
          <>
            <div className="wallet-detail">
              <label>Gas</label>
              <span style={{ color: '#10b981' }}>⚡ Sponsored</span>
            </div>
            
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
              borderRadius: '8px',
              border: '1px solid #8b5cf6'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '8px' }}>
                🦄 Unicorn Features
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#7c3aed'
                }}>
                  Gasless
                </span>
                <span style={{
                  background: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#7c3aed'
                }}>
                  Multi-sig
                </span>
                <span style={{
                  background: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#7c3aed'
                }}>
                  Session Keys
                </span>
                <span style={{
                  background: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#7c3aed'
                }}>
                  Auto-Connect
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <a
          href={`https://polygonscan.com/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: '#f3f4f6',
            borderRadius: '6px',
            textDecoration: 'none',
            color: '#4b5563',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => e.target.style.background = '#e5e7eb'}
          onMouseOut={(e) => e.target.style.background = '#f3f4f6'}
        >
          View on Explorer →
        </a>
      </div>
    </div>
  );
};

export default WalletInfo;
*/