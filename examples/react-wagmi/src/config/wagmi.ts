import { inAppWalletConnector } from '@thirdweb-dev/wagmi-adapter';
import { createConfig, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { createThirdwebClient, defineChain } from "thirdweb";

export const thirdwebClient = createThirdwebClient({
  clientId: "4e8c81182c3709ee441e30d776223354"
});

export const UNICORN_FACTORY_ADDRESS = "0xD771615c873ba5a2149D5312448cE01D677Ee48A";

const unicornConnector = inAppWalletConnector({
  client: thirdwebClient,
  smartAccount: {
    sponsorGas: true, // or false based on your needs / Unicorn requirements
    chain: defineChain(polygon.id),
    factoryAddress: UNICORN_FACTORY_ADDRESS,
  },
  metadata: {
    name: 'Unicorn.eth',
    icon: '/unicorn.png',
    image: {
      src: '/unicorn.png',
      alt: 'Unicorn.eth',
      height: 100,
      width: 100,
    },
  },
});

export const wagmiConfig = createConfig({
  chains: [polygon],
  connectors: [unicornConnector, injected()],
  transports: { [polygon.id]: http() }
});