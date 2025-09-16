// Coded lovingly by @cryptowampum and Claude AI
// config/thirdweb.js
import { createThirdwebClient } from 'thirdweb';
import { inAppWallet } from 'thirdweb/wallets';
import { polygon } from 'thirdweb/chains';

export const thirdwebClient = createThirdwebClient({
  clientId: "4e8c81182c3709ee441e30d776223354",
});

export const unicornWallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
      chain: polygon,
      gasless: true,
    }
  })
];