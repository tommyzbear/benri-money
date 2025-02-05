import { create } from 'zustand';
import { Contact } from '@/types/search';

interface ContactsState {
    friends: Contact[];
    searchResults: Contact[];
    searchQuery: string;
    isLoading: boolean;
    error: string | null;
    setSearchQuery: (query: string) => void;
    fetchFriends: () => Promise<void>;
    searchContacts: (query: string) => Promise<void>;
    addFriend: (friendId: string) => Promise<void>;
}

export const useContactsStore = create<ContactsState>((set, get) => ({
    friends: [],
    searchResults: [],
    searchQuery: "",
    isLoading: false,
    error: null,

    setSearchQuery: (query: string) => {
        set({ searchQuery: query });
        // Trigger search if query exists
        if (query.trim()) {
            get().searchContacts(query);
        } else {
            set({ searchResults: [] });
        }
    },

    fetchFriends: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch('/api/contacts/friends');
            if (!response.ok) throw new Error('Failed to fetch friends');

            const { data } = await response.json();
            set({ friends: data, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch friends',
                isLoading: false
            });
        }
    },

    searchContacts: async (query: string) => {
        if (!query.trim()) {
            set({ searchResults: [] });
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`/api/contacts/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Failed to search contacts');

            const { data } = await response.json();
            set({ searchResults: data, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to search contacts',
                isLoading: false
            });
        }
    },

    addFriend: async (friendId: string) => {
        try {
            const response = await fetch('/api/contacts/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friendId }),
            });

            if (!response.ok) throw new Error('Failed to add friend');

            // Update the search results to reflect the new friend status
            set((state) => ({
                searchResults: state.searchResults.map(contact =>
                    contact.id === friendId ? { ...contact, isFriend: true } : contact
                )
            }));

            // Refetch friends list
            await get().fetchFriends();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to add friend' });
            throw error;
        }
    },
})); 