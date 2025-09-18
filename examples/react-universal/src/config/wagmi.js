// src/config/wagmi.js - Simple configuration for Step 1
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, mainnet } from 'wagmi/chains';

// For now, we'll use a placeholder project ID
// Get your own at: https://cloud.walletconnect.com
const projectId = '8645c1b6390926a248c31b92742c4286';

export const config = getDefaultConfig({
  appName: 'Unicorn Universal dApp',
  projectId: projectId,
  chains: [polygon, mainnet],
  ssr: false, // Not using server-side rendering
});