import React from 'react';
import { useUnicornAccount } from '../hooks/useUnicornAccount';

const WalletStatus = () => {
  const { address, isConnected } = useUnicornAccount();

  if (!isConnected) {
    return <div><h3>Wallet Status</h3><p>Not connected</p></div>;
  }

  return (
    <div>
      <h3>Wallet Status</h3>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Type:</strong> 🦄 Unicorn Smart Account</p>
      <p><strong>Network:</strong> ✅ Polygon</p>
      <p><strong>Gas:</strong> ⚡ Sponsored</p>
    </div>
  );
};

export default WalletStatus;
