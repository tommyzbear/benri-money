import { create } from 'zustand';
import { TransactionHistory } from '@/types/data';

interface TransactionsState {
    transactions: TransactionHistory[];
    isLoading: boolean;
    error: string | null;
    fetchTransactions: () => Promise<void>;
    addTransaction: (transaction: Omit<TransactionHistory, "id" | "created_at" | "amount"> & { amount: string }) => Promise<void>;
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
    transactions: [],
    isLoading: false,
    error: null,

    fetchTransactions: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch('/api/transactions');
            if (!response.ok) throw new Error('Failed to fetch transactions');

            const { data } = await response.json();
            set({
                transactions: data,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch transactions',
                isLoading: false
            });
        }
    },

    addTransaction: async (transaction) => {
        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transaction),
            });

            if (!response.ok) throw new Error('Failed to save transaction');

            // Refetch transactions to get the latest data
            const { data } = await response.json();
            set((state) => ({
                transactions: [data, ...state.transactions],
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to add transaction'
            });
            throw error; // Re-throw to handle in the component
        }
    },
})); 