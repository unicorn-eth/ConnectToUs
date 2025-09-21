// coded lovingly by @cryptowampum and Claude AI
// src/components/UnicornAutoConnect.jsx - Using Thirdweb's AutoConnect
import React from 'react';
import { AutoConnect } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { inAppWallet } from 'thirdweb/wallets';
import { polygon } from 'thirdweb/chains';

// Create client outside component to avoid recreation
const client = createThirdwebClient({
  clientId: "4e8c81182c3709ee441e30d776223354"
});

// Configure wallet
const wallets = [
  inAppWallet({
    smartAccount: {
      chain: polygon,
      gasless: true,
      factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
    }
  })
];

function UnicornAutoConnect() {
  return (
    <AutoConnect
      client={client}
      wallets={wallets}
      accountAbstraction={{
        chain: polygon,
        gasless: true,
        factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
      }}
      onConnect={(wallet) => {
        console.log('🦄 Unicorn wallet auto-connected successfully!');
        console.log('Wallet:', wallet);
        console.log('Address:', wallet.getAccount?.()?.address);
      }}
      onError={(error) => {
        console.error('❌ Unicorn AutoConnect failed:', error);
        console.log('Error details:', {
          message: error.message,
          cause: error.cause,
          stack: error.stack
        });
      }}
      timeout={5000} // Give it 5 seconds to connect
    />
  );
}

export default UnicornAutoConnect;