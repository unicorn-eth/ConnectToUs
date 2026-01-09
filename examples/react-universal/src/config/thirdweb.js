// config/thirdweb.js - Modularized configuration with environment variables
// Coded lovingly by @cryptowampum and Claude AI

import { createThirdwebClient } from 'thirdweb';
import { inAppWallet } from 'thirdweb/wallets';
import { 
  polygon, 
  base, 
  ethereum, 
  arbitrum, 
  optimism, 
  mainnet 
} from 'thirdweb/chains';

// Environment configuration with defaults
const config = {
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID ,
  factoryAddress: import.meta.env.VITE_THIRDWEB_FACTORY_ADDRESS ,
  defaultChain: import.meta.env.VITE_DEFAULT_CHAIN || "base",
  enableAutoConnect: import.meta.env.VITE_ENABLE_AUTO_CONNECT !== "false",
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG_MODE === "true",
};

// Chain mapping
const chainMap = {
  'polygon': polygon,
  'base': base,
  'ethereum': ethereum,
  'mainnet': ethereum, // Alias for ethereum
  'arbitrum': arbitrum,
  'optimism': optimism,
};

// Get chain by name with validation
export const getChainByName = (chainName) => {
  const normalizedName = chainName?.toLowerCase() || config.defaultChain;
  const chain = chainMap[normalizedName];
  
  if (!chain) {
    console.warn(`Unknown chain "${chainName}", falling back to ${config.defaultChain}`);
    return chainMap[config.defaultChain] || base;
  }
  
  return chain;
};

// Get the default chain
export const getDefaultChain = () => {
  return getChainByName(config.defaultChain);
};

// Create Thirdweb client
export const thirdwebClient = createThirdwebClient({
  clientId: config.clientId,
});

// Create Unicorn wallet configuration with dynamic chain
export const createUnicornWallet = (chainName = null) => {
  const chain = chainName ? getChainByName(chainName) : getDefaultChain();
  
  if (config.enableDebug) {
    console.log('🦄 Creating Unicorn wallet config:', {
      chain: chain.name,
      chainId: chain.id,
      factoryAddress: config.factoryAddress,
    });
  }
  
  return inAppWallet({
    smartAccount: {
      factoryAddress: config.factoryAddress,
      chain: chain,
      gasless: true,
    }
  });
};

// Default Unicorn wallets array for backward compatibility
export const unicornWallets = [createUnicornWallet()];

// Configuration validation
export const validateConfig = () => {
  const issues = [];
  
  if (!config.clientId) {
    issues.push('VITE_THIRDWEB_CLIENT_ID is required');
  }
  
  if (!config.factoryAddress || !config.factoryAddress.startsWith('0x')) {
    issues.push('VITE_THIRDWEB_FACTORY_ADDRESS must be a valid Ethereum address');
  }
  
  if (!chainMap[config.defaultChain]) {
    issues.push(`VITE_DEFAULT_CHAIN "${config.defaultChain}" is not supported`);
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    config,
  };
};

// Auto-validation in development
if (import.meta.env.DEV) {
  const validation = validateConfig();
  if (!validation.isValid) {
    console.error('🚨 Thirdweb configuration issues:', validation.issues);
  } else if (config.enableDebug) {
    console.log('✅ Thirdweb configuration valid:', validation.config);
  }
}

// Export configuration for other modules
export { config };

// Utility functions for URL parameter handling
export const getChainFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const chainParam = urlParams.get('chain');
  return chainParam ? getChainByName(chainParam) : getDefaultChain();
};

export const createUnicornWalletFromUrl = () => {
  const chain = getChainFromUrl();
  return createUnicornWallet(chain.name);
};

// Helper to get supported chains list
export const getSupportedChains = () => {
  return Object.keys(chainMap).map(name => ({
    name,
    chain: chainMap[name],
    id: chainMap[name].id,
  }));
};

// Export for debugging
if (typeof window !== 'undefined' && config.enableDebug) {
  window.__unicornConfig = {
    config,
    validateConfig,
    getSupportedChains,
    getChainByName,
    createUnicornWallet,
  };
}