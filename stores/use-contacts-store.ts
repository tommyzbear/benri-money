import { create } from 'zustand';
import { Contact } from '@/types/search';

interface ContactsStore {
    friends: Contact[];
    searchResults: Contact[];
    searchQuery: string;
    isLoading: boolean;
    error: string | null;
    setSearchQuery: (query: string) => void;
    fetchFriends: () => Promise<void>;
    addFriend: (contactId: string) => Promise<void>;
    unfriend: (contactId: string) => Promise<void>;
}

export const useContactsStore = create<ContactsStore>((set, get) => ({
    friends: [],
    searchResults: [],
    searchQuery: "",
    isLoading: false,
    error: null,

    setSearchQuery: async (query) => {
        set({ searchQuery: query });
        if (!query) {
            set({ searchResults: [] });
            return;
        }

        try {
            set({ isLoading: true });
            const response = await fetch(`/api/contacts/search?q=${query}`);
            if (!response.ok) throw new Error('Search failed');
            const { data } = await response.json();
            set({ searchResults: data });
        } catch (error) {
            set({ error: 'Failed to search contacts' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchFriends: async () => {
        try {
            set({ isLoading: true });
            const response = await fetch('/api/contacts/friends');
            if (!response.ok) throw new Error('Failed to fetch friends');
            const { data } = await response.json();
            set({ friends: data });
        } catch (error) {
            set({ error: 'Failed to fetch friends' });
        } finally {
            set({ isLoading: false });
        }
    },

    addFriend: async (contactId) => {
        try {
            const response = await fetch('/api/contacts/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friendId: contactId }),
            });

            if (!response.ok) throw new Error('Failed to add friend');

            set(state => ({
                searchResults: state.searchResults.map(contact =>
                    contact.id === contactId ? { ...contact, isFriend: true } : contact
                )
            }));
            await get().fetchFriends();
        } catch (error) {
            throw new Error('Failed to add friend');
        }
    },

    unfriend: async (contactId) => {
        try {
            const response = await fetch(`/api/contacts/friends/${contactId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to unfriend');

            // Update both friends and search results
            set(state => ({
                friends: state.friends.filter(friend => friend.id !== contactId),
                searchResults: state.searchResults.map(contact =>
                    contact.id === contactId ? { ...contact, isFriend: false } : contact
                )
            }));
        } catch (error) {
            throw new Error('Failed to remove friend');
        }
    },
})); 