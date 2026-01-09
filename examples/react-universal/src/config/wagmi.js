// src/config/wagmi.js - Updated with environment variable support
// Coded lovingly by @cryptowampum and Claude AI

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { getSupportedChains, getDefaultChain } from './thirdweb';

// Get configuration from environment
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '8645c1b6390926a248c31b92742c4286';
const appName = import.meta.env.VITE_APP_NAME || 'Universal Unicorn dApp';

// Get supported chains from thirdweb config
const supportedChainsList = getSupportedChains();
const chains = supportedChainsList.map(item => item.chain);
const defaultChain = getDefaultChain();

// Ensure default chain is first in the list for better UX
const orderedChains = [
  defaultChain,
  ...chains.filter(chain => chain.id !== defaultChain.id)
];

if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEBUG_MODE === "true") {
  console.log('🔗 Wagmi configuration:', {
    defaultChain: defaultChain.name,
    supportedChains: orderedChains.map(c => c.name),
    projectId: projectId.slice(0, 8) + '...',
    appName,
  });
}

export const config = getDefaultConfig({
  appName: appName,
  projectId: projectId,
  chains: orderedChains,
  ssr: false, // Not using server-side rendering
});

// Export chain information for other components
export { orderedChains as chains, defaultChain };