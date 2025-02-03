'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { arbitrumGoerli, arbitrumSepolia, baseSepolia, optimismSepolia, sepolia } from 'viem/chains';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
            config={{
                defaultChain: baseSepolia,
                supportedChains: [baseSepolia, arbitrumSepolia, arbitrumGoerli, sepolia, optimismSepolia],
                // Customize Privy's appearance in your app
                appearance: {
                    theme: 'light',
                    accentColor: '#676FFF',
                    logo: '/logo.png',
                },
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                    createOnLogin: 'all-users',
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}