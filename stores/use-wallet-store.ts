import { create } from 'zustand';
import { Chain } from '@wagmi/core/chains';
import { getBalance, GetBalanceReturnType } from '@wagmi/core';
import { config } from '@/lib/wallet/config';

interface WalletBalance {
    chain: Chain;
    balance: GetBalanceReturnType;
}

interface WalletState {
    balances: WalletBalance[];
    isLoading: boolean;
    error: string | null;
    fetchBalances: (address: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
    balances: [],
    isLoading: false,
    error: null,
    fetchBalances: async (address: string) => {
        set({ isLoading: true, error: null });
        try {
            const balances = await Promise.all(
                config.chains.map(async (chain) => {
                    const balance = await getBalance(config, {
                        address: address as `0x${string}`,
                        chainId: chain.id,
                    });
                    return { chain, balance };
                })
            );
            set({ balances, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch balances',
                isLoading: false
            });
        }
    },
})); 