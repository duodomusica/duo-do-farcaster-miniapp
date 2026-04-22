import { http, createConfig } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id";

export const wagmiConfig = createConfig({
  chains: [base, mainnet],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  connectors: [
    farcasterMiniApp(),
    injected(),
    coinbaseWallet({ 
      appName: "Duo Do at FarCon Rome",
      preference: "all",
    }),
    walletConnect({ projectId }),
  ],
});
