// coded lovingly by @cryptowampum and Claude AI
// src/components/UnicornAutoConnect.jsx - WITH CONTEXT
import React from 'react';
import { AutoConnect } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { inAppWallet } from 'thirdweb/wallets';
import { polygon } from 'thirdweb/chains';
import { useUnicorn } from '../context/UnicornContext';

// Create client outside component
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
  const { handleUnicornConnect } = useUnicorn();

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
        
        // Get the address
        const account = wallet.getAccount?.();
        const address = account?.address;
        console.log('Address:', address);
        
        // Store in context so other components can see it
        handleUnicornConnect(wallet, address);
      }}
      onError={(error) => {
        console.error('❌ Unicorn AutoConnect failed:', error);
      }}
      timeout={5000}
    />
  );
}

export default UnicornAutoConnect;