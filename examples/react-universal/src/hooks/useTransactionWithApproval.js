// hooks/useTransactionWithApproval.js
// Coded lovingly by @cryptowampum and Claude AI

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { sendTransaction, prepareSendTransaction } from '@wagmi/core';
import { parseEther } from 'viem';

export const useTransactionWithApproval = () => {
  const { address, connector } = useAccount();
  const { chain } = useNetwork();
  
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [txHistory, setTxHistory] = useState(() => {
    // Load history from localStorage
    const saved = localStorage.getItem('tx_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [userPreferences, setUserPreferences] = useState(() => {
    const saved = localStorage.getItem('tx_preferences');
    return saved ? JSON.parse(saved) : {
      autoApproveThreshold: 0,
      requireSimulation: true,
      requireConfirmation: true,
      saveHistory: true,
    };
  });

  // Save history to localStorage when it changes
  useEffect(() => {
    if (userPreferences.saveHistory) {
      localStorage.setItem('tx_history', JSON.stringify(txHistory.slice(0, 50)));
    }
  }, [txHistory, userPreferences.saveHistory]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('tx_preferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  const requestTransactionApproval = useCallback(async (txDetails) => {
    // Enhance transaction details with current context
    const enhancedDetails = {
      ...txDetails,
      from: address,
      chainId: chain?.id,
      chainName: chain?.name,
      timestamp: Date.now(),
    };

    // Check if auto-approval is possible
    const txValue = txDetails.value ? parseFloat(txDetails.value) : 0;
    
    // Auto-approve conditions
    const canAutoApprove = 
      !userPreferences.requireConfirmation ||
      (txValue <= userPreferences.autoApproveThreshold && txValue === 0);

    if (canAutoApprove) {
      // Auto-approve for zero-value transactions if enabled
      return await executeTransaction(enhancedDetails);
    }

    // Show approval modal
    return new Promise((resolve, reject) => {
      setPendingTransaction({
        ...enhancedDetails,
        resolve,
        reject
      });
      setIsApprovalModalOpen(true);
    });
  }, [address, chain, userPreferences]);

  const executeTransaction = useCallback(async (txDetails) => {
    const startTime = Date.now();
    
    try {
      let result;

      // Handle different transaction types
      if (txDetails.transaction) {
        // Thirdweb transaction object
        const { sendTransaction } = await import('thirdweb');
        result = await sendTransaction({
          transaction: txDetails.transaction,
          account: txDetails.from,
        });
      } else if (txDetails.prepared) {
        // Pre-prepared wagmi transaction
        result = await sendTransaction(txDetails.prepared);
      } else {
        // Raw transaction details
        const prepared = await prepareSendTransaction({
          to: txDetails.to,
          value: txDetails.value ? parseEther(txDetails.value.toString()) : undefined,
          data: txDetails.data,
        });
        result = await sendTransaction(prepared);
      }

      // Save to history
      if (userPreferences.saveHistory) {
        const historyEntry = {
          hash: result.hash || result.transactionHash,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
          method: txDetails.method || 'Unknown',
          to: txDetails.to,
          from: txDetails.from,
          value: txDetails.value || '0',
          chainId: chain?.id,
          chainName: chain?.name,
          status: 'success',
          gasUsed: result.gasUsed?.toString(),
        };
        
        setTxHistory(prev => [historyEntry, ...prev].slice(0, 100));
      }

      return result;
    } catch (error) {
      // Log failed transaction
      if (userPreferences.saveHistory) {
        const historyEntry = {
          timestamp: Date.now(),
          duration: Date.now() - startTime,
          method: txDetails.method || 'Unknown',
          to: txDetails.to,
          from: txDetails.from,
          value: txDetails.value || '0',
          chainId: chain?.id,
          chainName: chain?.name,
          status: 'failed',
          error: error.message,
        };
        
        setTxHistory(prev => [historyEntry, ...prev].slice(0, 100));
      }
      
      throw error;
    }
  }, [chain, userPreferences.saveHistory]);

  const approveTransaction = useCallback(async () => {
    if (!pendingTransaction) return;
    
    try {
      const result = await executeTransaction(pendingTransaction);
      pendingTransaction.resolve?.(result);
    } catch (error) {
      pendingTransaction.reject?.(error);
    } finally {
      setIsApprovalModalOpen(false);
      setPendingTransaction(null);
    }
  }, [pendingTransaction, executeTransaction]);

  const rejectTransaction = useCallback(() => {
    if (pendingTransaction?.reject) {
      pendingTransaction.reject(new Error('User rejected transaction'));
    }
    setIsApprovalModalOpen(false);
    setPendingTransaction(null);
  }, [pendingTransaction]);

  const clearHistory = useCallback(() => {
    setTxHistory([]);
    localStorage.removeItem('tx_history');
  }, []);

  const getRecentTransactions = useCallback((limit = 5) => {
    return txHistory.slice(0, limit);
  }, [txHistory]);

  const getTransactionStats = useCallback(() => {
    const stats = txHistory.reduce((acc, tx) => {
      acc.total++;
      if (tx.status === 'success') acc.successful++;
      else acc.failed++;
      
      if (tx.duration) {
        acc.totalDuration += tx.duration;
      }
      
      return acc;
    }, { 
      total: 0, 
      successful: 0, 
      failed: 0, 
      totalDuration: 0 
    });

    stats.averageDuration = stats.total > 0 ? 
      Math.round(stats.totalDuration / stats.total) : 0;
    
    stats.successRate = stats.total > 0 ?
      Math.round((stats.successful / stats.total) * 100) : 0;

    return stats;
  }, [txHistory]);

  return {
    // Core functionality
    requestTransactionApproval,
    approveTransaction,
    rejectTransaction,
    
    // Modal state
    isApprovalModalOpen,
    pendingTransaction,
    
    // History management
    txHistory,
    clearHistory,
    getRecentTransactions,
    getTransactionStats,
    
    // Settings
    userPreferences,
    setUserPreferences,
    
    // Utility
    isUnicornWallet: connector?.id === 'inApp' || connector?.name === 'Unicorn.eth',
  };
};