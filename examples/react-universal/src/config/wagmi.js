// Coded lovingly by @cryptowampum and Claude AI
// config/wagmi.js - Support for ALL wallets
import { createConfig, http } from 'wagmi';
import { 
  polygon, 
  mainnet, 
  arbitrum, 
  optimism,
  base,
  zora 
} from 'wagmi/chains';
import { 
  injected,
  walletConnect,
  coinbase,
  safe,
} from 'wagmi/connectors';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
  argentWallet,
  trustWallet,
  ledgerWallet,
  safeWallet,
  braveWallet,
  rabbyWallet,
  okxWallet,
} from '@rainbow-me/rainbowkit/wallets';

// Export chains for RainbowKit
export const chains = [polygon, mainnet, arbitrum, optimism, base, zora];

// Get WalletConnect project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE';

// Configure RainbowKit wallets with proper grouping
const wallets = [
  {
    groupName: 'Popular',
    wallets: [
      metaMaskWallet,
      rainbowWallet,
      walletConnectWallet,
      coinbaseWallet,
    ],
  },
  {
    groupName: 'More',
    wallets: [
      argentWallet,
      trustWallet,
      ledgerWallet,
      safeWallet,
      braveWallet,
      rabbyWallet,
      okxWallet,
    ],
  },
];

// Create connectors for RainbowKit
export const connectors = connectorsForWallets(
  wallets,
  {
    appName: 'Universal Unicorn dApp',
    projectId,
  }
);

// Create Wagmi config with ALL wallet support
export const wagmiConfig = createConfig({
  connectors,
  chains,
  transports: {
    [polygon.id]: http(getAlchemyUrl('polygon')),
    [mainnet.id]: http(getAlchemyUrl('mainnet')),
    [arbitrum.id]: http(getAlchemyUrl('arbitrum')),
    [optimism.id]: http(getAlchemyUrl('optimism')),
    [base.id]: http(),
    [zora.id]: http(),
  },
  ssr: false,
});

// Helper function to get RPC URLs
function getAlchemyUrl(chain) {
  const alchemyId = import.meta.env.VITE_ALCHEMY_ID;
  
  if (!alchemyId) {
    // Fallback to public RPCs
    const publicRpcs = {
      polygon: 'https://polygon-rpc.com',
      mainnet: 'https://eth.llamarpc.com',
      arbitrum: 'https://arb1.arbitrum.io/rpc',
      optimism: 'https://mainnet.optimism.io',
    };
    return publicRpcs[chain];
  }
  
  const alchemyUrls = {
    polygon: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyId}`,
    mainnet: `https://eth-mainnet.g.alchemy.com/v2/${alchemyId}`,
    arbitrum: `https://arb-mainnet.g.alchemy.com/v2/${alchemyId}`,
    optimism: `https://opt-mainnet.g.alchemy.com/v2/${alchemyId}`,
  };
  
  return alchemyUrls[chain];
}

// Export wallet metadata for UI display
export const supportedWallets = [
  { name: 'MetaMask', icon: '🦊', id: 'metamask' },
  { name: 'Rainbow', icon: '🌈', id: 'rainbow' },
  { name: 'WalletConnect', icon: '🔗', id: 'walletconnect' },
  { name: 'Coinbase', icon: '💰', id: 'coinbase' },
  { name: 'Argent', icon: '🛡️', id: 'argent' },
  { name: 'Trust', icon: '💎', id: 'trust' },
  { name: 'Ledger', icon: '🔐', id: 'ledger' },
  { name: 'Safe', icon: '🔒', id: 'safe' },
  { name: 'Brave', icon: '🦁', id: 'brave' },
  { name: 'Rabby', icon: '🐰', id: 'rabby' },
  { name: 'OKX', icon: '⭕', id: 'okx' },
];