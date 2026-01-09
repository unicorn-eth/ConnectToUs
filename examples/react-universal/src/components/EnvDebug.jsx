// src/components/EnvDebug.jsx - Check what environment variables are actually loaded
import React from 'react';

function EnvDebug() {
  const envVars = {
    VITE_WALLETCONNECT_PROJECT_ID: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    VITE_THIRDWEB_CLIENT_ID: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
    VITE_THIRDWEB_FACTORY_ADDRESS: import.meta.env.VITE_THIRDWEB_FACTORY_ADDRESS,
    VITE_DEFAULT_CHAIN: import.meta.env.VITE_DEFAULT_CHAIN,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_ALCHEMY_ID: import.meta.env.VITE_ALCHEMY_ID,
    VITE_INFURA_ID: import.meta.env.VITE_INFURA_ID,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };

  const wcId = envVars.VITE_WALLETCONNECT_PROJECT_ID;
  const isValidWcId = wcId && wcId.length > 10 && !wcId.includes('your_project_id');

  return (
    <div style={{
      background: '#fee2e2',
      border: '2px solid #ef4444',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '16px',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#dc2626' }}>
        🔍 Environment Variables Debug
      </h3>
      
      <div style={{ marginBottom: '16px' }}>
        <strong>WalletConnect Status:</strong> {isValidWcId ? '✅ Valid' : '❌ Invalid/Missing'}
        {wcId && (
          <div>
            Value: {wcId.slice(0, 8)}...{wcId.slice(-4)} (length: {wcId.length})
          </div>
        )}
      </div>

      <details>
        <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
          <strong>All Environment Variables</strong>
        </summary>
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          padding: '8px',
          marginTop: '8px'
        }}>
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '4px' }}>
              <strong>{key}:</strong> {value || '❌ undefined'}
            </div>
          ))}
        </div>
      </details>

      <div style={{ 
        marginTop: '12px', 
        padding: '8px', 
        background: '#fef3c7', 
        border: '1px solid #f59e0b',
        borderRadius: '4px'
      }}>
        <strong>Troubleshooting Steps:</strong>
        <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Make sure your file is named <code>.env</code> (not .env.local)</li>
          <li>Restart your dev server completely (<code>Ctrl+C</code> then <code>npm run dev</code>)</li>
          <li>Check file is in project root (same level as package.json)</li>
          <li>No spaces around = in env file</li>
          <li>Clear browser cache and hard refresh</li>
        </ol>
      </div>

      <div style={{ 
        marginTop: '8px', 
        fontSize: '11px', 
        color: '#6b7280' 
      }}>
        Current working directory: {window.location.origin}
        <br />
        Dev server should restart when .env changes
      </div>
    </div>
  );
}

export default EnvDebug;