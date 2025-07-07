import React from 'react';
import { 
  useAccount, 
  useConnect, 
  useDisconnect 
} from 'wagmi';

const ConnectButtonWagmi: React.FC = () => {
  // Hook to get account information
  const { address, isConnected, isConnecting } = useAccount();

  // Hook to handle the connection logic
  const { connect, connectors, error, isPending } = useConnect();

  // Hook to handle disconnection
  const { disconnect } = useDisconnect();

  // Format the address for display (e.g., 0x1234...5678)
  const formattedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}` 
    : null;

  // Handles the initial page load connection check
  if (isConnecting) {
    return (
      <button disabled style={buttonStyles.disabled}>
        Loading...
      </button>
    );
  }

  // Renders when a wallet is connected
  if (isConnected) {
    return (
      <div style={styles.connectedContainer}>
        <span style={styles.address}>🦄 {formattedAddress}</span>
        <button onClick={() => disconnect()} style={buttonStyles.base}>
          Disconnect
        </button>
      </div>
    );
  }

  // Renders connection options when no wallet is connected
  return (
    <div>
      {/* Map over all available connectors (e.g., MetaMask, WalletConnect) */}
      {connectors.filter((el) => el.name === "Unicorn.eth" || el.name === "MetaMask").map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending} // Disable while any connection is pending
          style={isPending ? buttonStyles.disabled : buttonStyles.base}
        >
          {/* Show a pending state specific to the clicked connector */}
          {isPending ? 'Connecting...' : `Connect ${connector.name}`}
        </button>
      ))}

      {error && (
        <p style={{ color: 'red', marginTop: '10px' }}>
          {/* Wagmi provides a user-friendly `shortMessage` */}
          ❌ {(error as any).shortMessage || error.message}
        </p>
      )}
    </div>
  );
};

// Optional: Keep styles organized
const styles = {
  connectedContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  address: {
    padding: '8px 12px',
    backgroundColor: '#f3e8ff',
    borderRadius: '5px',
    fontWeight: 500,
  }
};

const buttonStyles = {
  base: {
    padding: '10px 20px',
    backgroundColor: '#8b5cf6',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    margin: '4px',
  },
  disabled: {
    padding: '10px 20px',
    backgroundColor: '#ccc',
    color: '#666',
    border: 'none',
    borderRadius: '5px',
    cursor: 'not-allowed',
    margin: '4px',
  }
};


export default ConnectButtonWagmi;