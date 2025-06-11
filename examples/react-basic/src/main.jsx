import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Global polyfills for Web3 compatibility
if (typeof global === 'undefined') {
  var global = globalThis;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)