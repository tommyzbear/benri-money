"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { mainnet, base, polygon } from "viem/chains";
import {SmartWalletsProvider} from '@privy-io/react-auth/smart-wallets';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
            config={{
                defaultChain: base,
                supportedChains: [mainnet, polygon, base],
                // Customize Privy's appearance in your app
                appearance: {
                    theme: "light",
                    accentColor: "#676FFF",
                    logo: "/logo.png",
                },
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                    createOnLogin: "all-users", // defaults to 'off'
                },
                // externalWallets: {
                //     solana: {
                //         connectors: toSolanaWalletConnectors(),
                //     },
                // },
                // solanaClusters: [
                //     { name: "mainnet-beta", rpcUrl: "https://api.mainnet-beta.solana.com" },
                // ],
                fundingMethodConfig: {
                    moonpay: {
                        paymentMethod: "credit_debit_card", // Purchase with credit or debit card
                        uiConfig: { accentColor: "#696FFD", theme: "light" }, // Styling preferences for MoonPay's UIs
                    },
                },
            }}
        >
            <SmartWalletsProvider
            >
                {children}
            </SmartWalletsProvider>
        </PrivyProvider>
    );
}
