import { create } from 'zustand';
import { Account } from '@/types/data';

interface UserStore {
    user: Account | null;
    isLoading: boolean;
    error: string | null;
    fetchUser: () => Promise<void>;
    updateUsername: (username: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    isLoading: false,
    error: null,

    fetchUser: async () => {
        try {
            set({ isLoading: true });
            const response = await fetch('/api/user');
            if (!response.ok) throw new Error('Failed to fetch user');
            const { data } = await response.json();
            set({ user: data });
        } catch (error) {
            set({ error: 'Failed to fetch user' });
        } finally {
            set({ isLoading: false });
        }
    },

    updateUsername: async (username: string) => {
        try {
            const response = await fetch('/api/user/username', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update username');
            }

            // Update local state
            set(state => ({
                user: state.user ? { ...state.user, username } : null
            }));
        } catch (error) {
            throw error;
        }
    },
})); 