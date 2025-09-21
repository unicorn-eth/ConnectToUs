// src/App.jsx - MINIMAL WORKING VERSION WITHOUT createWallet
import React from 'react';
import './App.css';
import WalletInfo from './components/WalletInfo';

// Basic App that just renders - no wallet functionality yet
function App() {
  return (
    <div className="App">
      <header style={{ 
        padding: '20px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <h1>🦄 Universal Wallet dApp</h1>
        <p>Basic React App is Working!</p>
      </header>

<main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
  {/* ... existing progress div ... */}
  
  {/* Add this new section */}
  <div style={{ marginBottom: '20px' }}>
    <WalletInfo />
  </div>
  
  {/* ... rest of the content ... */}

        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2>✅ Setup Status</h2>
          <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
            <li>✅ React is loading</li>
            <li>✅ Vite dev server is working</li>
            <li>✅ No import errors</li>
            <li>⏳ Wallet integration coming next...</li>
          </ul>
        </div>

        <div style={{ 
          background: '#fef3c7', 
          border: '2px solid #f59e0b',
          padding: '20px', 
          borderRadius: '8px'
        }}>
          <h3>📝 Next Steps</h3>
          <ol style={{ textAlign: 'left', lineHeight: '1.8' }}>
            <li>This basic version is working</li>
            <li>Now we'll add wallet support step by step</li>
            <li>First RainbowKit, then Unicorn AutoConnect</li>
          </ol>
          
          <div style={{ marginTop: '20px', padding: '10px', background: 'white', borderRadius: '4px' }}>
            <code>Current URL: {window.location.href}</code>
          </div>
          
          {window.location.search.includes('walletId') && (
            <div style={{ marginTop: '10px', padding: '10px', background: '#8b5cf6', color: 'white', borderRadius: '4px' }}>
              🦄 Unicorn parameters detected in URL!
            </div>
          )}
        </div>
        // Add WalletInfo in the main section (after the progress div):

      </main>
    </div>
  );
}

export default App;