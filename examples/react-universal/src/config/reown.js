// coded lovingly by @cryptowampum and Claude AI
// config/reown.js - Latest Reown AppKit setup
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { 
  polygon, 
  mainnet, 
  arbitrum,
  optimism 
} from '@reown/appkit/networks';

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

// 2. Create wagmiAdapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [polygon, mainnet, arbitrum, optimism],
  projectId,
});

// 3. Create modal
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [polygon, mainnet, arbitrum, optimism],
  projectId,
  metadata: {
    name: 'Universal dApp',
    description: 'Works with all wallets including Unicorn',
    url: 'https://yourdapp.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  },
  features: {
    analytics: true,
    email: false, // Set to true if you want email login
    socials: [], // Add social logins if needed
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#8b5cf6',
    '--w3m-border-radius-master': '8px',
  }
});