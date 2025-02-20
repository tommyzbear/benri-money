"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { mainnet, optimism, arbitrum, base, baseSepolia, sepolia } from "viem/chains";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
            config={{
                defaultChain: mainnet,
                supportedChains: [mainnet, arbitrum, optimism, base, baseSepolia, sepolia],
                // Customize Privy's appearance in your app
                appearance: {
                    theme: "light",
                    accentColor: "#676FFF",
                    logo: "/logo.png",
                },
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                    createOnLogin: "users-without-wallets", // defaults to 'off'
                },
                externalWallets: {
                    solana: {
                        connectors: toSolanaWalletConnectors(),
                    },
                },
                solanaClusters: [
                    { name: "mainnet-beta", rpcUrl: "https://api.mainnet-beta.solana.com" },
                ],
                fundingMethodConfig: {
                    moonpay: {
                        paymentMethod: "credit_debit_card", // Purchase with credit or debit card
                        uiConfig: { accentColor: "#696FFD", theme: "light" }, // Styling preferences for MoonPay's UIs
                    },
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}
