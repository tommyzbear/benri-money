import { create } from 'zustand';
import { PaymentRequestWithWallet } from '@/types/data';

interface PaymentRequestsState {
    pendingRequests: PaymentRequestWithWallet[];
    count: number;
    isLoading: boolean;
    error: string | null;
    fetchPendingRequests: () => Promise<void>;
    clearRequest: (requestId: number) => Promise<void>;
}

export const usePaymentRequestsStore = create<PaymentRequestsState>((set, get) => ({
    pendingRequests: [],
    count: 0,
    isLoading: false,
    error: null,

    fetchPendingRequests: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch('/api/requests/pending');
            if (!response.ok) throw new Error('Failed to fetch pending requests');

            const { data } = await response.json();
            set({
                pendingRequests: data,
                count: data.length,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch requests',
                isLoading: false
            });
        }
    },

    clearRequest: async (requestId: number) => {
        try {
            const response = await fetch(`/api/requests/${requestId}/clear`, {
                method: 'POST',
            });

            if (!response.ok) throw new Error('Failed to clear request');

            // Update local state by removing the cleared request
            const currentRequests = get().pendingRequests;
            const updatedRequests = currentRequests.filter(req => req.id !== requestId);

            set({
                pendingRequests: updatedRequests,
                count: updatedRequests.length
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to clear request'
            });
        }
    },
})); 