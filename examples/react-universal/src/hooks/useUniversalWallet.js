// Coded lovingly by @cryptowampum and Claude AI
// hooks/useUniversalWallet.js
import { useAccount as useWagmiAccount } from 'wagmi';
import { useActiveAccount as useThirdwebAccount } from 'thirdweb/react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useEffect, useState } from 'react';

export const useUniversalWallet = () => {
  const wagmiAccount = useWagmiAccount();
  const thirdwebAccount = useThirdwebAccount();
  const appKitAccount = useAppKitAccount();
  
  const [account, setAccount] = useState(null);
  const [walletType, setWalletType] = useState(null);

  useEffect(() => {
    // Priority: Check all wallet sources
    if (thirdwebAccount?.address) {
      setAccount({
        address: thirdwebAccount.address,
        isConnected: true,
        connector: 'thirdweb',
      });
      setWalletType('unicorn');
    } else if (wagmiAccount.address) {
      setAccount({
        address: wagmiAccount.address,
        isConnected: wagmiAccount.isConnected,
        connector: wagmiAccount.connector?.name,
      });
      setWalletType(wagmiAccount.connector?.id);
    } else if (appKitAccount.address) {
      setAccount({
        address: appKitAccount.address,
        isConnected: appKitAccount.isConnected,
        connector: 'appkit',
      });
      setWalletType('appkit');
    } else {
      setAccount(null);
      setWalletType(null);
    }
  }, [wagmiAccount, thirdwebAccount, appKitAccount]);

  return {
    account,
    walletType,
    isConnected: !!account?.isConnected,
    address: account?.address,
    isUnicornWallet: walletType === 'unicorn',
  };
};