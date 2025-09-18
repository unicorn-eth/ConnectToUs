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
  console.log('🚀 Starting Universal Unicorn dApp...');
  console.log('📦 Environment:', import.meta.env.MODE);
  console.log('🔗 URL:', window.location.href);
  
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

  console.log('Debug commands available:');
  console.log('- window.__debugUnicorn() - Show debug info');
  console.log('- window.__forceUnicornMode(true/false) - Toggle Unicorn mode');
}

// Error boundary for better error reporting
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fee2e2', margin: '20px', borderRadius: '8px' }}>
          <h2>❌ Something went wrong</h2>
          <details style={{ marginTop: '10px' }}>
            <summary>Error details</summary>
            <pre style={{ marginTop: '10px', background: 'white', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
              {this.state.error?.toString()}
              {this.state.error?.stack}
            </pre>
          </details>
          <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '10px 20px' }}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Render the app with error boundary
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);