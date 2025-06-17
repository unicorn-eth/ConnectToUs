import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

if (typeof global === 'undefined') {
  var global = globalThis;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
