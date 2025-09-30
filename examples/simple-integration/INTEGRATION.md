// Simple Unicorn Integration Guide
// For developers who want to add Unicorn AutoConnect to existing apps WITHOUT breaking anything

/* 
=== STEP 1: Install dependencies ===
npm install thirdweb

=== STEP 2: Add environment variables to your .env ===
VITE_THIRDWEB_CLIENT_ID=4e8c81182c3709ee441e30d776223354
VITE_THIRDWEB_FACTORY_ADDRESS=0xD771615c873ba5a2149D5312448cE01D677Ee48A
VITE_DEFAULT_CHAIN=base
VITE_ENABLE_UNICORN_AUTOCONNECT=true

=== STEP 3: Create UnicornAutoConnect component ===
*/

// src/components/UnicornAutoConnect.jsx
import React from 'react';
import { ThirdwebProvider, AutoConnect } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { inAppWallet } from 'thirdweb/wallets';
import { base, polygon } from 'thirdweb/chains';

// Simple chain mapping
const getChain = (chainName) => {
  const chains = { base, polygon };
  return chains[chainName?.toLowerCase()] || base;
};

// Simple environment detection
const isUnicornEnvironment = () => {
  const params = new URLSearchParams(window.location.search);
  return params.has('walletId') && params.get('walletId') === 'inApp';
};

const UnicornAutoConnect = ({ onConnect, onError }) => {
  // Don't render if not in Unicorn environment
  if (!isUnicornEnvironment()) {
    return null;
  }

  const client = createThirdwebClient({
    clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "4e8c81182c3709ee441e30d776223354"
  });

  const chain = getChain(import.meta.env.VITE_DEFAULT_CHAIN);
  
  const wallet = inAppWallet({
    smartAccount: {
      factoryAddress: import.meta.env.VITE_THIRDWEB_FACTORY_ADDRESS || "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
      chain: chain,
      gasless: true,
    }
  });

  return (
    <ThirdwebProvider>
      <div style={{ display: 'none' }}>
        <AutoConnect
          client={client}
          wallets={[wallet]}
          onConnect={(wallet) => {
            console.log('🦄 Unicorn AutoConnect successful');
            onConnect?.(wallet);
          }}
          onError={(error) => {
            console.log('🦄 Unicorn AutoConnect failed (silently)');
            onError?.(error);
          }}
          timeout={5000}
        />
      </div>
    </ThirdwebProvider>
  );
};

export default UnicornAutoConnect;

/* 
=== STEP 4: Add to your existing App.jsx ===

Just add this ONE line to your existing App component:

import UnicornAutoConnect from './components/UnicornAutoConnect';

function App() {
  return (
    <div>
      {/* Your existing app code - DON'T CHANGE ANYTHING */}
      <YourExistingWalletProvider>
        <YourExistingContent />
      </YourExistingWalletProvider>
      
      {/* Just add this one line */}
      <UnicornAutoConnect />
    </div>
  );
}

=== THAT'S IT! ===

No changes to your existing wallet configuration.
No changes to your existing providers.
No changes to your existing code.

The UnicornAutoConnect will:
- Only run when accessed via Unicorn portal (?walletId=inApp)
- Run silently in the background
- Not interfere with your existing wallet connections
- Not show any errors if it fails

Your existing wallet connections will work exactly as before.
*/