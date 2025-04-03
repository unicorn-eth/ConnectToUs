# Add Your dApp to the any community's App Center
How to enable autoConnect for your dApp to so it can be added to any MyUnicornAccount community's app center. This will expose your dApp to the 19k attendees at ETHDenver and make it an optional dApp for all Unicorn.eth communities.

Once you have completed these steps, please submit your dApp to this form https://forms.gle/3kyuEce2fZtd7Umy9 so we can review your dApp and it can be added allowed dApps in the "App Center".

## AutoConnect Documentation

Unicorn.eth is committed to delivering best-in-class UX and safety for its users. Our autoConnect feature ensures a seamless and secure experience by:

- Automatically handling chain and network switching for users.
- Eliminating friction associated with traditional wallet connection flows.
- Preventing interactions with phishing links or malicious dApps designed to steal user funds.

## How It Works

Unicorn wallets can only connect to dApps that integrate our autoConnect function and are whitelisted by community admins. Adding custom dApps to the Unicorn App Center is straightforward.

To list a dApp on the Unicorn App Store, you must enable automatic wallet connection. Our smart contract wallets are issued by [Thirdweb](https://thirdweb.com/), so you must integrate their SDK to establish this connection.

---

# Integration Guide

There are three primary methods to integrate autoConnect based on your existing setup and framework.

## 1. For React dApps Using the Thirdweb SDK

Use this method if your dApp is already built with the Thirdweb SDK. This is the simplest approach and allows seamless integration without additional dependencies.

- Thirdweb SDK
    
    ### **1. Install the Thirdweb SDK (if you haven’t already)**
    
    ```bash
    npm install thirdweb
    ```
    
    ### **2. Wrap the app layout with ThirdwebProvider**
    
    Add the following code around your app's layout:
    
    ```jsx
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
    ```
    
    ### **3. Add the autoConnect Component**
    
    Place the `autoConnect` component within your app tree. Below is an example setup:
    
    ```jsx
    import { createThirdwebClient } from "thirdweb";
    import { polygon  } from "thirdweb/chains";
    
    // Configuration
    const clientId = "4e8c81182c3709ee441e30d776223354";
    const factoryAddress = "0xD771615c873ba5a2149D5312448cE01D677Ee48A";
    const accountAbstraction = {
      factoryAddress,
      chain: polygon,
      gasless: true,
    };
    
    const supportedWallets = [
      inAppWallet({ smartAccount: accountAbstraction })
    ];
    
    // Create client
    const client = createThirdwebClient({ clientId });
    
    // Add to your app tree
    <ThirdwebProvider>
      <AutoConnect client={client} wallets={supportedWallets} />
      {children}
    </ThirdwebProvider>
    ```
    

## 2. For React dApps Using the Wagmi Library

Use this approach if your dApp is built using Wagmi and you want to integrate Thirdweb autoConnect functionality seamlessly.

- Wagmi Adapter
    
    ### **1. Install Thirdweb SDK and Wagmi Adapter**
    
    Run the following command:
    
    ```bash
    npm install thirdweb @thirdweb-dev/wagmi-adapter
    ```
    
    ### **2. Configure Your Wagmi Setup**
    
    Create and configure your Wagmi setup with Thirdweb:
    
    ```tsx
    
    import { createThirdwebClient, defineChain as thirdwebChain } from "thirdweb";
    import { createConfig, http } from "wagmi";
    import { inAppWalletConnector } from "@thirdweb-dev/wagmi-adapter";
    import { polygon } from "wagmi/chains";
    
    const client = createThirdwebClient({
      clientId: "4e8c81182c3709ee441e30d776223354",
    });
    
    export const config = createConfig({
      chains: [polygon],
      connectors: [
        // Add the in-app wallet connector
        inAppWalletConnector({
          client,
          smartAccount: {
            sponsorGas: true,
            chain: thirdwebChain(137),
            factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
          },
        }),
      ],
      transports: {
        [polygon.id]: http(),
      },
    });
    ```
    
    ### **3. Wrap Your App with `ThirdwebProvider`**
    
    Modify your app layout to include the necessary providers:
    
    ```tsx
    import { ThirdwebProvider } from "thirdweb/react";
    
    function MyApp({ Component, pageProps }: AppProps) {
      return (
        <WagmiProvider config={config}>
          <ThirdwebProvider>
            <QueryClientProvider client={client}>
              <RainbowKitProvider>
                <Component {...pageProps} />
              </RainbowKitProvider>
            </QueryClientProvider>
          </ThirdwebProvider>
        </WagmiProvider>
      );
    }
    ```
    

## 3. For Non-React dApps (Agnostic Implementation)

Use this approach if you are developing a dApp outside of React and need a universal way to integrate autoConnect.

- Agnostic Thirdweb SDK
    
    ### **1. Install Thirdweb SDK**
    
    Run the following command to install the SDK:
    
    ```bash
    npm install thirdweb
    ```
    
    ### 2. Configure Wallet Auto-Connect and Convert to EIP-1193 Provider
    
    Use the `autoConnect` function to establish a wallet connection and convert it into an EIP-1193 provider:
    
    ```jsx
    import { createThirdwebClient } from "thirdweb";
    import { polygon } from "thirdweb/chains";
    import { autoConnect, EIP1193 } from "thirdweb/wallets";
    
    // Initialize the Thirdweb client
    const client = createThirdwebClient({
      clientId: "4e8c81182c3709ee441e30d776223354",
    });
    
    // Auto-connect the wallet with account abstraction
    const autoConnected = await autoConnect({
      client,
      accountAbstraction: {
        chain: polygon,
        sponsorGas: true,
        factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
      },
      onConnect: (wallet) => {
        // Convert the Thirdweb wallet into an EIP-1193 provider
        const provider = EIP1193.toProvider({
          wallet,
          chain: polygon,
          client: createThirdwebClient({ clientId: "..." }),
        });
    
        // Inject this provider into your web3 framework
        // More details: https://portal.thirdweb.com/typescript/v5/adapters
      },
    });
    ```
