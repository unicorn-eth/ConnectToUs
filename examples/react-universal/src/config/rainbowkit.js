// config/rainbowkit.js
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  connectorsForWallets,
  Wallet
} from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
  argentWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { polygon, mainnet, arbitrum, optimism } from 'wagmi/chains';
import { createThirdwebClient } from 'thirdweb';

// Create custom Unicorn wallet connector
const unicornWallet = ({ chains }) => ({
  id: 'unicorn',
  name: 'Unicorn.eth',
  iconUrl: '/unicorn-icon.png', // Add your icon
  iconBackground: '#8b5cf6',
  hidden: false,
  
  createConnector: () => {
    const client = createThirdwebClient({
      clientId: "4e8c81182c3709ee441e30d776223354"
    });

    const connector = inAppWalletConnector({
      client,
      smartAccount: {
        factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
        chain: polygon,
        gasless: true,
      }
    });

    return {
      connector,
      mobile: {
        getUri: () => Promise.resolve(''),
      },
      desktop: {
        getUri: () => Promise.resolve(''),
      },
    };
  },
});

// Configure wallet groups
export const walletGroups = [
  {
    groupName: 'Recommended',
    wallets: [
      unicornWallet,
      metaMaskWallet,
      rainbowWallet,
      walletConnectWallet,
    ],
  },
  {
    groupName: 'Other',
    wallets: [
      coinbaseWallet,
      argentWallet,
      trustWallet,
      ledgerWallet,
    ],
  },
];

// Create connectors
export const connectors = connectorsForWallets(
  walletGroups,
  {
    appName: 'Your dApp Name',
    projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from https://cloud.walletconnect.com
    chains: [polygon, mainnet, arbitrum, optimism],
  }
);

// RainbowKit configuration
export const rainbowKitConfig = {
  appInfo: {
    appName: 'Your dApp Name',
    learnMoreUrl: 'https://yourdapp.com/learn',
  },
  chains: [polygon, mainnet, arbitrum, optimism],
  showRecentTransactions: true,
  coolMode: false, // Set to true for animation effects
};

// Custom theme (optional)
export const rainbowKitTheme = {
  colors: {
    accentColor: '#8b5cf6',
    accentColorForeground: 'white',
    actionButtonBorder: 'transparent',
    actionButtonBorderMobile: 'transparent',
    actionButtonSecondaryBackground: '#f3f4f6',
    closeButton: '#6b7280',
    closeButtonBackground: '#f9fafb',
    connectButtonBackground: '#8b5cf6',
    connectButtonBackgroundError: '#ef4444',
    connectButtonInnerBackground: '#7c3aed',
    connectButtonText: 'white',
    connectButtonTextError: 'white',
    connectionIndicator: '#10b981',
    downloadBottomCardBackground: '#ffffff',
    downloadTopCardBackground: '#f3f4f6',
    error: '#ef4444',
    generalBorder: '#e5e7eb',
    generalBorderDim: '#f3f4f6',
    menuItemBackground: '#f9fafb',
    modalBackdrop: 'rgba(0, 0, 0, 0.5)',
    modalBackground: '#ffffff',
    modalBorder: '#e5e7eb',
    modalText: '#1f2937',
    modalTextDim: '#6b7280',
    modalTextSecondary: '#6b7280',
    profileAction: '#f3f4f6',
    profileActionHover: '#e5e7eb',
    profileForeground: '#ffffff',
    selectedOptionBorder: '#8b5cf6',
    standby: '#fbbf24',
  },
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  radii: {
    actionButton: '8px',
    connectButton: '8px',
    menuButton: '8px',
    modal: '12px',
    modalMobile: '12px',
  },
};

// Export a provider component
export const RainbowKitProviderWrapper = ({ children }) => {
  return (
    <RainbowKitProvider
      {...rainbowKitConfig}
      theme={rainbowKitTheme}
      modalSize="compact"
    >
      {children}
    </RainbowKitProvider>
  );
};