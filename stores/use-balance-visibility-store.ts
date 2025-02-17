import { create } from "zustand";

interface BalanceVisibilityStore {
    showBalances: boolean;
    toggleBalances: () => void;
}

export const useBalanceVisibilityStore = create<BalanceVisibilityStore>((set) => ({
    showBalances: true,
    toggleBalances: () => set((state) => ({ showBalances: !state.showBalances })),
})); 