// config/wagmi.ts - Support ALL wallets
// Coded lovingly by @cryptowampum and Claude AI

import { createConfig, http } from "wagmi";
import { polygon, mainnet, arbitrum } from "wagmi/chains";
import { 
  injected, 
  walletConnect, 
  coinbaseWallet 
} from "wagmi/connectors";
import { inAppWalletConnector } from '@thirdweb-dev/wagmi-adapter';
import { createThirdwebClient } from "thirdweb";

const thirdwebClient = createThirdwebClient({
  clientId: "4e8c81182c3709ee441e30d776223354"
});

// Create Unicorn connector
const unicornConnector = inAppWalletConnector({
  client: thirdwebClient,
  smartAccount: {
    sponsorGas: true,
    chain: polygon,
    factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
  }
});

// WAGMI config with ALL connectors
export const wagmiConfig = createConfig({
  chains: [polygon, mainnet, arbitrum],
  connectors: [
    // Unicorn connector
    unicornConnector,
    
    // Standard connectors - ALWAYS AVAILABLE
    injected(), // MetaMask, Brave, etc.
    walletConnect({
      projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
    }),
    coinbaseWallet({
      appName: 'Your dApp',
    }),
  ],
  transports: {
    [polygon.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
  }
});