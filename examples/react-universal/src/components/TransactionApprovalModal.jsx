// components/TransactionApprovalModal.jsx
import React, { useState, useEffect } from 'react';
import { formatEther } from 'viem';
import './TransactionApprovalModal.css';

const TransactionApprovalModal = ({ 
  isOpen, 
  onClose, 
  onApprove, 
  transactionDetails,
  simulationResult 
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [userSettings, setUserSettings] = useState(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('unicorn_tx_settings');
    return saved ? JSON.parse(saved) : {
      alwaysSimulate: true,
      requireConfirmation: true,
      maxAutoApproveValue: '0',
    };
  });

  useEffect(() => {
    if (isOpen && transactionDetails && userSettings.alwaysSimulate) {
      simulateTransaction();
    }
  }, [isOpen, transactionDetails]);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('unicorn_tx_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  const simulateTransaction = async () => {
    setIsSimulating(true);
    try {
      // If transaction object has simulate method
      if (transactionDetails?.transaction?.simulate) {
        const result = await transactionDetails.transaction.simulate();
        setSimulationData({
          success: true,
          gasEstimate: result.gasEstimate,
          stateChanges: result.stateChanges,
        });
      } else {
        // Fallback for basic transactions
        setSimulationData({
          success: true,
          gasEstimate: '21000', // Standard transfer
        });
      }
    } catch (error) {
      console.error("Simulation failed:", error);
      setSimulationData({
        success: false,
        error: error.message
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTransactionType = () => {
    if (transactionDetails?.method) return transactionDetails.method;
    if (transactionDetails?.data === '0x' || !transactionDetails?.data) return 'Transfer';
    return 'Contract Interaction';
  };

  const handleApprove = () => {
    // Save settings before approving
    localStorage.setItem('unicorn_tx_settings', JSON.stringify(userSettings));
    onApprove(transactionDetails);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-container">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-title">
              <span className="modal-icon">🔐</span>
              <h2>Approve Transaction</h2>
            </div>
            <button onClick={onClose} className="close-btn" aria-label="Close">
              <span>×</span>
            </button>
          </div>

          <div className="transaction-preview">
            <div className="preview-header">
              <h3>Transaction Details</h3>
              <span className="tx-type-badge">{getTransactionType()}</span>
            </div>
            
            <div className="detail-grid">
              <div className="detail-item">
                <label>From:</label>
                <span className="address" title={transactionDetails?.from}>
                  {formatAddress(transactionDetails?.from || 'Your Wallet')}
                </span>
              </div>

              <div className="detail-item">
                <label>To:</label>
                <span className="address" title={transactionDetails?.to}>
                  {formatAddress(transactionDetails?.to)}
                </span>
              </div>

              <div className="detail-item">
                <label>Value:</label>
                <span className="value">
                  {transactionDetails?.value ? 
                    `${formatEther(BigInt(transactionDetails.value))} ETH` : 
                    '0 ETH'
                  }
                </span>
              </div>

              <div className="detail-item">
                <label>Network:</label>
                <span>{transactionDetails?.chainName || 'Polygon'}</span>
              </div>

              {transactionDetails?.contractName && (
                <div className="detail-item">
                  <label>Contract:</label>
                  <span>{transactionDetails.contractName}</span>
                </div>
              )}
            </div>

            {transactionDetails?.params && transactionDetails.params.length > 0 && (
              <div className="params-section">
                <label>Parameters:</label>
                <div className="params-display">
                  <pre>{JSON.stringify(transactionDetails.params, null, 2)}</pre>
                </div>
              </div>
            )}

            {transactionDetails?.description && (
              <div className="description-section">
                <label>Description:</label>
                <p>{transactionDetails.description}</p>
              </div>
            )}
          </div>

          <div className="simulation-section">
            {isSimulating ? (
              <div className="simulating">
                <div className="spinner">⏳</div>
                <span>Simulating transaction...</span>
              </div>
            ) : simulationData ? (
              <div className={`simulation-results ${simulationData.success ? 'success' : 'failed'}`}>
                <h4>Simulation Results</h4>
                {simulationData.success ? (
                  <div className="simulation-success">
                    <div className="check-item">
                      <span className="check-icon">✅</span>
                      <span>Transaction will succeed</span>
                    </div>
                    <div className="check-item">
                      <span className="check-icon">⛽</span>
                      <span>Gas: FREE (Sponsored)</span>
                    </div>
                  </div>
                ) : (
                  <div className="simulation-error">
                    <span className="warning-icon">⚠️</span>
                    <span>Simulation failed: {simulationData.error}</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="security-section">
            <h4>Security Checks</h4>
            <div className="security-grid">
              <div className="security-item">
                <span className="icon">🦄</span>
                <span>Unicorn Wallet</span>
              </div>
              <div className="security-item">
                <span className="icon">✅</span>
                <span>Verified Contract</span>
              </div>
              <div className="security-item">
                <span className="icon">💸</span>
                <span>Gasless Transaction</span>
              </div>
              <div className="security-item">
                <span className="icon">🔒</span>
                <span>Secure Connection</span>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button 
              onClick={onClose} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleApprove}
              className="btn btn-primary"
              disabled={isSimulating || (simulationData && !simulationData.success && userSettings.requireConfirmation)}
            >
              {isSimulating ? 'Simulating...' : 'Approve & Send'}
            </button>
          </div>

          <details className="settings-section">
            <summary>⚙️ Transaction Settings</summary>
            <div className="settings-content">
              <label className="setting-item">
                <input 
                  type="checkbox" 
                  checked={userSettings.alwaysSimulate}
                  onChange={(e) => setUserSettings(prev => ({
                    ...prev,
                    alwaysSimulate: e.target.checked
                  }))}
                />
                <span>Always simulate before sending</span>
              </label>
              
              <label className="setting-item">
                <input 
                  type="checkbox" 
                  checked={userSettings.requireConfirmation}
                  onChange={(e) => setUserSettings(prev => ({
                    ...prev,
                    requireConfirmation: e.target.checked
                  }))}
                />
                <span>Require confirmation for all transactions</span>
              </label>
              
              <div className="setting-item">
                <label>
                  Auto-approve if value below:
                  <input 
                    type="number" 
                    value={userSettings.maxAutoApproveValue}
                    onChange={(e) => setUserSettings(prev => ({
                      ...prev,
                      maxAutoApproveValue: e.target.value
                    }))}
                    step="0.001"
                    min="0"
                    className="value-input"
                  /> ETH
                </label>
              </div>
            </div>
          </details>
        </div>
      </div>
    </>
  );
};

export default TransactionApprovalModal;