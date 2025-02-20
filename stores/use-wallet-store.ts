import { create } from "zustand";
import { getBalance, GetBalanceReturnType } from "@wagmi/core";
import { config } from "@/lib/wallet/config";
import { approvedTokens } from "@/lib/wallet/coinlist";

interface WalletState {
    totalBalance: number;
    balances: Record<string, GetBalanceReturnType[]>;
    isLoading: boolean;
    error: string | null;
    fetchBalances: (address: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
    totalBalance: 12345.67,
    balances: {},
    isLoading: false,
    error: null,
    fetchBalances: async (address: string) => {
        set({ isLoading: true, error: null });
        try {
            const balancesByChain = await Promise.all(
                config.chains.map(async (chain) => {
                    const balance = await getBalance(config, {
                        address: address as `0x${string}`,
                        chainId: chain.id,
                    });

                    const altCoinBalances = await Promise.all(
                        approvedTokens[chain.name].map(
                            async (token) =>
                                await getBalance(config, {
                                    address: address as `0x${string}`,
                                    chainId: chain.id,
                                    token: token.address as `0x${string}`,
                                })
                        )
                    );

                    return { [chain.name]: [balance, ...altCoinBalances] };
                })
            );

            set({
                balances: balancesByChain.reduce((acc, curr) => {
                    Object.keys(curr).forEach((key) => {
                        acc[key] = curr[key];
                    });
                    return acc;
                }, {}),
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to fetch balances",
                isLoading: false,
            });
        }
    },
}));
