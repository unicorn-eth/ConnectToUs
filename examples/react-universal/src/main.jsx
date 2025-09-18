// src/main.jsx - MINIMAL VERSION THAT WORKS
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Only import CSS if it exists
try {
  import('./index.css');
} catch (e) {
  console.log('No index.css found, continuing without styles');
}

// Basic polyfills
if (typeof global === 'undefined') {
  window.global = window;
}

console.log('🚀 Starting app...');

// Render the app
const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ React app mounted');
} else {
  console.error('❌ Could not find root element');
}