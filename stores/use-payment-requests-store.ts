import { create } from 'zustand';
import { PaymentRequestWithWallet } from '@/types/data';

interface PaymentRequestsStore {
    pendingRequests: PaymentRequestWithWallet[];
    sentRequests: PaymentRequestWithWallet[];
    isLoading: boolean;
    error: string | null;
    fetchPendingRequests: () => Promise<void>;
    fetchSentRequests: () => Promise<void>;
    clearRequest: (requestId: number) => Promise<void>;
    rejectRequest: (requestId: number) => Promise<void>;
}

export const usePaymentRequestsStore = create<PaymentRequestsStore>((set, get) => ({
    pendingRequests: [],
    sentRequests: [],
    isLoading: false,
    error: null,

    fetchPendingRequests: async () => {
        try {
            set({ isLoading: true });
            const response = await fetch('/api/payment-requests/pending');
            if (!response.ok) throw new Error('Failed to fetch pending requests');
            const { data } = await response.json();
            set({ pendingRequests: data });
        } catch (error) {
            set({ error: 'Failed to fetch pending requests' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchSentRequests: async () => {
        try {
            set({ isLoading: true });
            const response = await fetch('/api/payment-requests/sent');
            if (!response.ok) throw new Error('Failed to fetch sent requests');
            const { data } = await response.json();
            set({ sentRequests: data });
        } catch (error) {
            set({ error: 'Failed to fetch sent requests' });
        } finally {
            set({ isLoading: false });
        }
    },

    clearRequest: async (requestId) => {
        try {
            const response = await fetch(`/api/payment-requests/${requestId}/clear`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to clear request');

            // Update local state
            set(state => ({
                pendingRequests: state.pendingRequests.filter(req => req.id !== requestId),
                sentRequests: state.sentRequests.map(req =>
                    req.id === requestId ? { ...req, cleared: true } : req
                )
            }));
        } catch (error) {
            throw new Error('Failed to clear request');
        }
    },

    rejectRequest: async (requestId) => {
        try {
            const response = await fetch(`/api/payment-requests/${requestId}/reject`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to reject request');

            // Update local state
            set(state => ({
                pendingRequests: state.pendingRequests.filter(req => req.id !== requestId),
                sentRequests: state.sentRequests.map(req =>
                    req.id === requestId ? { ...req, rejected: true } : req
                )
            }));
        } catch (error) {
            throw new Error('Failed to reject request');
        }
    }
})); 