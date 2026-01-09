// src/components/ChainSwitcher.jsx - Debug component for testing chain switching
// Coded lovingly by @cryptowampum and Claude AI

import React from 'react';
import { getSupportedChains, getChainFromUrl, config } from '../config/thirdweb';

function ChainSwitcher() {
  const supportedChains = getSupportedChains();
  const currentChain = getChainFromUrl();
  
  // Only show in debug mode
  if (!config.enableDebug) {
    return null;
  }
  
  const switchToChain = (chainName) => {
    const url = new URL(window.location);
    url.searchParams.set('chain', chainName);
    window.location.href = url.toString();
  };
  
  const clearChainOverride = () => {
    const url = new URL(window.location);
    url.searchParams.delete('chain');
    window.location.href = url.toString();
  };
  
  return (
    <div style={{
      background: '#f3f4f6',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '16px'
    }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#374151' }}>
        🔧 Chain Switcher (Debug Mode)
      </h4>
      
      <div style={{ marginBottom: '12px', fontSize: '12px', color: '#6b7280' }}>
        Current: <strong>{currentChain.name}</strong> (ID: {currentChain.id})
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px',
        marginBottom: '12px'
      }}>
        {supportedChains.map((chain) => (
          <button
            key={chain.name}
            onClick={() => switchToChain(chain.name)}
            style={{
              padding: '6px 12px',
              border: chain.id === currentChain.id ? '2px solid #8b5cf6' : '1px solid #d1d5db',
              borderRadius: '4px',
              background: chain.id === currentChain.id ? '#f3e8ff' : 'white',
              color: chain.id === currentChain.id ? '#7c3aed' : '#374151',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: chain.id === currentChain.id ? '600' : '400'
            }}
          >
            {chain.name}
          </button>
        ))}
      </div>
      
      <button
        onClick={clearChainOverride}
        style={{
          padding: '6px 12px',
          border: '1px solid #ef4444',
          borderRadius: '4px',
          background: '#fef2f2',
          color: '#dc2626',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        Clear Override
      </button>
      
      <div style={{ 
        marginTop: '8px', 
        fontSize: '11px', 
        color: '#9ca3af',
        fontStyle: 'italic'
      }}>
        💡 URL parameters: ?chain=polygon, ?chain=base, etc.
      </div>
    </div>
  );
}

export default ChainSwitcher;