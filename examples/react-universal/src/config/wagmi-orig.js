// Coded lovingly by @cryptowampum and Claude AI
// config/wagmi.js - Support for ALL wallets (FIXED for wagmi v2)
import { createConfig, http } from 'wagmi';
import { 
  polygon, 
  mainnet, 
  arbitrum, 
  optimism,
  base 
} from 'wagmi/chains';
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
} from '@rainbow-me/rainbowkit/wallets';

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
// Export chains for RainbowKit
export const chains = [polygon, mainnet, arbitrum, optimism, base];

// Get WalletConnect project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE';

// Configure RainbowKit wallets with proper grouping
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet({ projectId, chains }),
        rainbowWallet({ projectId, chains }),
        coinbaseWallet({ appName: 'Universal Unicorn dApp', chains }),
        walletConnectWallet({ projectId, chains }),
      ],
    },
    {
      groupName: 'More',
      wallets: [
        argentWallet({ projectId, chains }),
        trustWallet({ projectId, chains }),
        ledgerWallet({ projectId, chains }),
        safeWallet({ chains }),
      ],
    },
  ],
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

// Export wallet metadata for UI display (optional)
export const supportedWallets = [
  { name: 'MetaMask', icon: '🦊', id: 'metamask' },
  { name: 'Rainbow', icon: '🌈', id: 'rainbow' },
  { name: 'Coinbase', icon: '💰', id: 'coinbase' },
  { name: 'WalletConnect', icon: '🔗', id: 'walletconnect' },
  { name: 'Argent', icon: '🛡️', id: 'argent' },
  { name: 'Trust', icon: '💎', id: 'trust' },
  { name: 'Ledger', icon: '🔐', id: 'ledger' },
  { name: 'Safe', icon: '🔒', id: 'safe' },
];