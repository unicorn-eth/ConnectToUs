// src/App.jsx - MINIMAL VERSION FOR TESTING
// If the full version doesn't work, try this simplified version first

import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>🦄 Universal Wallet dApp - Test Version</h1>
        <p>If you see this, the basic React setup is working!</p>
      </header>
      
      <main className="app-main">
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', margin: '20px' }}>
          <h2>Setup Status:</h2>
          <ul>
            <li>✅ React is working</li>
            <li>✅ Vite is serving the app</li>
            <li>✅ Basic routing works</li>
          </ul>
          
          <h3>Next Steps:</h3>
          <ol>
            <li>Replace this with the full App.jsx</li>
            <li>Make sure all dependencies are installed</li>
            <li>Check browser console for errors (F12)</li>
          </ol>
          
          <div style={{ marginTop: '20px', padding: '10px', background: '#f3f4f6', borderRadius: '4px' }}>
            <code>Current URL: {window.location.href}</code>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;