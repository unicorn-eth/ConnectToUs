import { createThirdwebClient } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";

// Unicorn.eth official configuration
export const UNICORN_CLIENT_ID = "4e8c81182c3709ee441e30d776223354";
export const UNICORN_FACTORY_ADDRESS = "0xD771615c873ba5a2149D5312448cE01D677Ee48A";

// Create the Thirdweb client
export const client = createThirdwebClient({
  clientId: UNICORN_CLIENT_ID,
});

// Configure smart account wallets
export const unicornWallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: UNICORN_FACTORY_ADDRESS,
      chain: polygon,
      gasless: true,
    }
  })
];

// Supported chains for this dApp
export const supportedChains = [polygon];

// App metadata
export const APP_METADATA = {
  name: "Unicorn dApp Example",
  description: "Demonstrating seamless Unicorn.eth wallet integration",
  url: "https://your-dapp.com",
  icons: ["https://your-dapp.com/icon-192.png"],
};