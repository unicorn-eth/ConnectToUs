import { useAccount } from "wagmi";

const WalletStatus = () => {
  const { address, isConnected, chain } = useAccount();

  if (!isConnected) {
    return <div><h3>Wallet Status</h3><p>Not connected</p></div>;
  }

  return (
    <div>
      <h3>Wallet Status</h3>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Type:</strong> 🦄 Unicorn Smart Account</p>
      <p><strong>Network:</strong> ✅ {chain?.name}</p>
      <p><strong>Gas:</strong> ⚡ Sponsored</p>
    </div>
  );
};

export default WalletStatus;
