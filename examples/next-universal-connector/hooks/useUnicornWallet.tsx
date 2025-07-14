import { useEffect, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';

export function useUnicornWallet() {
  const account = useActiveAccount();
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    if (account) {
      setIsConnected(true);
      setAddress(account.address);
    } else {
      setIsConnected(false);
      setAddress('');
    }
  }, [account]);

  return {
    isConnected,
    address,
    account,
  };
}