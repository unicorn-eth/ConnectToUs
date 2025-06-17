import { createConfig, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { createThirdwebClient } from "thirdweb";

export const wagmiConfig = createConfig({
  chains: [polygon],
  connectors: [injected()],
  transports: { [polygon.id]: http() }
});

export const thirdwebClient = createThirdwebClient({
  clientId: "4e8c81182c3709ee441e30d776223354"
});

export const UNICORN_FACTORY_ADDRESS = "0xD771615c873ba5a2149D5312448cE01D677Ee48A";
