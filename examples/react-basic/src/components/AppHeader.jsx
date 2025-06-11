import React from 'react';

const AppHeader = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <span className="unicorn-logo">🦄</span>
          <div className="title-section">
            <h1>Unicorn dApp Example</h1>
            <p className="subtitle">Seamless Web3 wallet integration</p>
          </div>
        </div>
        
        <div className="status-badges">
          <span className="badge polygon-badge">Polygon</span>
          <span className="badge gasless-badge">Gasless</span>
          <span className="badge secure-badge">Secure</span>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;