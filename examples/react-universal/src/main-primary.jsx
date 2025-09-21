// src/main.jsx - React application entry point
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Global polyfills for Web3 compatibility
if (typeof global === 'undefined') {
  window.global = globalThis;
}

// Buffer polyfill
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

// Process polyfill
if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: {},
    version: '',
    nextTick: (callback) => setTimeout(callback, 0),
  };
}

// Development helpers
if (import.meta.env.DEV) {
  // Add debugging helpers to window
  window.__debugUnicorn = () => {
    console.log('🦄 Unicorn Debug Info:');
    console.log('URL Params:', Object.fromEntries(new URLSearchParams(window.location.search)));
    console.log('Is in iframe:', window.self !== window.top);
    console.log('Referrer:', document.referrer || 'none');
    console.log('Local Storage:', {
      unicorn_connected: localStorage.getItem('unicorn_connected'),
      last_wallet: localStorage.getItem('last_wallet_connection'),
    });
  };

  window.__forceUnicornMode = (enabled) => {
    if (enabled) {
      window.location.href = window.location.origin + '/?walletId=inApp&authCookie=test';
    } else {
      window.location.href = window.location.origin;
    }
  };

  console.log('🦄 Universal Unicorn dApp');
  console.log('Debug commands available:');
  console.log('- window.__debugUnicorn() - Show debug info');
  console.log('- window.__forceUnicornMode(true/false) - Toggle Unicorn mode');
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);