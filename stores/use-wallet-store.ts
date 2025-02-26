import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { config } from "@/lib/wallet/config";
import { TokenData } from "@/app/services/alchemy";

interface WalletState {
    totalBalance: number | undefined;
    balances: Record<string, TokenData[]>;
    isLoading: boolean;
    error: string | null;
    fetchBalances: (address: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>()(
    persist(
        (set) => ({
            totalBalance: undefined,
            balances: {},
            isLoading: false,
            error: null,
            fetchBalances: async (address: string) => {
                set({ isLoading: true, error: null });
                try {
                    const balancesByChain = await Promise.all(config.chains.map(async (chain) => {
                        const response = await fetch(`/api/balance?address=${address}&chain=${chain.name}`);
                        if (!response.ok) {
                            throw new Error('Failed to fetch balance');
                        }
                        const data = await response.json();
                        return { [chain.name]: data.tokens };
                    }));

                    const balances = balancesByChain.reduce((acc, curr) => {
                        Object.keys(curr).forEach((key) => {
                            acc[key] = curr[key];
                        });
                        return acc;
                    }, {});

                    const totalBalance = Object.values(balances).reduce((acc, curr) => {
                        return acc + curr.reduce((acc, curr) => acc + Number(curr.value), 0);
                    }, 0);

                    set({
                        balances,
                        totalBalance,
                        isLoading: false,
                    });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : "Failed to fetch balances",
                        isLoading: false,
                    });
                }
            },
        }),
        {
            name: 'wallet-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state: WalletState) => ({
                totalBalance: state.totalBalance,
                balances: state.balances,
            }),
        }
    )
);
