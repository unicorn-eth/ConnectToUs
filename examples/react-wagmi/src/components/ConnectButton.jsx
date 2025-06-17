import React from 'react';
import { useUnicornAccount } from '../hooks/useUnicornAccount';

const ConnectButton = () => {
  const { isConnected, isConnecting, formattedAddress, connectUnicornWallet, disconnect, error } = useUnicornAccount();

  if (isConnecting) {
    return <button disabled>Connecting...</button>;
  }

  if (isConnected) {
    return (
      <div>
        <span>🦄 {formattedAddress}</span>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={connectUnicornWallet}>Connect Unicorn Wallet</button>
      {error && <p style={{color: 'red'}}>❌ {error}</p>}
    </div>
  );
};

export default ConnectButton;
