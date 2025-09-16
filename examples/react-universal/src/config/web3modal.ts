// config/web3modal.js
// Coded lovingly by @cryptowampum and Claude AI
import { createWeb3Modal } from '@web3modal/wagmi';
import { wagmiConfig } from './wagmi';

// Include Unicorn alongside other wallets
export const web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId: 'YOUR_PROJECT_ID',
  chains: [polygon, mainnet],
  // All wallets available
  includeWalletIds: [
    'unicorn', // Custom Unicorn wallet
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust
  ],
  // Auto-connect only if Unicorn params present
  enableAutoConnect: window.location.search.includes('walletId=inApp')
});