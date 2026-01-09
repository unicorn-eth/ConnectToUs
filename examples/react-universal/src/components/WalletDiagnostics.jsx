// src/components/WalletDiagnostics.jsx - Debug wallet connection issues
// Coded lovingly by @cryptowampum and Claude AI

import React, { useState } from 'react';
import { useAccount, useConnect, useConnectors } from 'wagmi';
import { config as thirdwebConfig } from '../config/thirdweb';

function WalletDiagnostics() {
  const { isConnected, address, connector } = useAccount();
  const { connect, error, isLoading, pendingConnector } = useConnect();
  const connectors = useConnectors();
  const [showDetails, setShowDetails] = useState(false);
  
  // Only show in debug mode
  if (!thirdwebConfig.enableDebug) {
    return null;
  }
  
  const testWalletConnection = async (connectorToTest) => {
    try {
      console.log(`🔌 Testing connection to ${connectorToTest.name}...`);
      await connect({ connector: connectorToTest });
    } catch (err) {
      console.error(`❌ Failed to connect to ${connectorToTest.name}:`, err);
    }
  };
  
  const getConnectorStatus = (conn) => {
    if (pendingConnector?.id === conn.id) return '⏳ Connecting...';
    if (isConnected && connector?.id === conn.id) return '✅ Connected';
    return '⚪ Ready';
  };
  
  const hasValidWalletConnectId = () => {
    const wcId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
    return wcId && wcId.length > 10 && !wcId.includes('your_project_id');
  };
  
  // Check for duplicate connector IDs
  const connectorIds = connectors.map(c => c.id);
  const duplicateIds = connectorIds.filter((id, index) => connectorIds.indexOf(id) !== index);
  const hasDuplicates = duplicateIds.length > 0;
  
  return (
    <div style={{
      background: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '16px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h4 style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
          🔧 Wallet Connection Diagnostics
        </h4>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: 'transparent',
            border: '1px solid #f59e0b',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer',
            color: '#92400e'
          }}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>
      
      {/* Quick Status */}
      <div style={{ marginBottom: '12px', fontSize: '12px' }}>
        <div>Status: {isConnected ? '✅ Connected' : '⚪ Not Connected'}</div>
        {isConnected && (
          <div>Wallet: {connector?.name} • {address?.slice(0, 6)}...{address?.slice(-4)}</div>
        )}
        <div>WalletConnect ID: {hasValidWalletConnectId() ? '✅ Valid' : '❌ Invalid/Missing'}</div>
        <div>Duplicate Connectors: {hasDuplicates ? `❌ Found: ${duplicateIds.join(', ')}` : '✅ None'}</div>
      </div>
      
      {hasDuplicates && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '4px',
          padding: '8px',
          marginBottom: '12px',
          fontSize: '12px',
          color: '#991b1b'
        }}>
          <strong>⚠️ Duplicate Connector Warning:</strong> Found duplicate IDs: {duplicateIds.join(', ')}
          <br />This can cause wallet connection failures. Check your Wagmi configuration.
        </div>
      )}
      
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '4px',
          padding: '8px',
          marginBottom: '12px',
          fontSize: '12px',
          color: '#991b1b'
        }}>
          <strong>Connection Error:</strong> {error.message}
        </div>
      )}
      
      {showDetails && (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ fontSize: '12px', color: '#92400e' }}>Available Connectors:</strong>
          </div>
          
          <div style={{ display: 'grid', gap: '8px' }}>
            {connectors.map((conn) => (
              <div
                key={conn.id}
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  padding: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ fontSize: '12px' }}>
                  <div><strong>{conn.name}</strong> ({conn.id})</div>
                  <div style={{ color: '#6b7280' }}>
                    Ready: {conn.ready ? '✅' : '❌'} • 
                    Status: {getConnectorStatus(conn)}
                  </div>
                </div>
                
                <button
                  onClick={() => testWalletConnection(conn)}
                  disabled={isLoading || (isConnected && connector?.id === conn.id)}
                  style={{
                    background: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading || (isConnected && connector?.id === conn.id) ? 0.5 : 1
                  }}
                >
                  Test
                </button>
              </div>
            ))}
          </div>
          
          <div style={{ 
            marginTop: '12px', 
            fontSize: '11px', 
            color: '#6b7280',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '8px'
          }}>
            <div><strong>Environment Check:</strong></div>
            <div>WalletConnect Project ID: {import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.slice(0, 8) || 'Missing'}...</div>
            <div>App Name: {import.meta.env.VITE_APP_NAME || 'Default'}</div>
            <div>Mode: {import.meta.env.MODE}</div>
            <div>User Agent: {navigator.userAgent.slice(0, 50)}...</div>
          </div>
          
          {!hasValidWalletConnectId() && (
            <div style={{
              marginTop: '8px',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '4px',
              padding: '8px',
              fontSize: '11px',
              color: '#991b1b'
            }}>
              <strong>⚠️ WalletConnect Setup Required:</strong><br/>
              1. Go to <a href="https://cloud.walletconnect.com" target="_blank" rel="noopener noreferrer">cloud.walletconnect.com</a><br/>
              2. Create a project and get your Project ID<br/>
              3. Add VITE_WALLETCONNECT_PROJECT_ID=your_id_here to your .env file<br/>
              4. Restart your dev server
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WalletDiagnostics;