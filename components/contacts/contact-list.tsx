"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Email, Wallet } from "@/types/data";
import Image from "next/image";
import { blo } from "blo";
import { Send, Plus, HandCoins, Check } from "lucide-react";

type ContactListProps = {
    searchQuery?: string;
};

type SearchResult = {
    id: string;
    email: Email[];
    wallet: Wallet[];
    isFriend?: boolean;
};

export function ContactList({ searchQuery }: ContactListProps) {
    const [contacts, setContacts] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [addingFriend, setAddingFriend] = useState<string | null>(null);

    const handleAddFriend = async (contactId: string) => {
        try {
            setAddingFriend(contactId);
            const response = await fetch('/api/contacts/friends', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ friendId: contactId }),
            });

            if (!response.ok) {
                throw new Error('Failed to add friend');
            }

            // Update the local state to show the contact as a friend
            setContacts(prevContacts =>
                prevContacts.map(contact =>
                    contact.id === contactId
                        ? { ...contact, isFriend: true }
                        : contact
                )
            );
        } catch (error) {
            console.error('Error adding friend:', error);
        } finally {
            setAddingFriend(null);
        }
    };

    useEffect(() => {
        async function fetchContacts() {
            setLoading(true);
            try {
                if (searchQuery) {
                    const response = await fetch(`/api/contacts/search?q=${encodeURIComponent(searchQuery)}`);
                    const { data } = await response.json();
                    setContacts(data);
                } else {
                    const response = await fetch('/api/contacts/friends');
                    const { data } = await response.json();
                    // Mark these contacts as friends since they're from the friends list
                    setContacts(data.map(contact => ({ ...contact, isFriend: true })));
                }
            } catch (error) {
                console.error('Error fetching contacts:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchContacts();
    }, [searchQuery]);

    if (loading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    return (
        <div className="space-y-2">
            {contacts.map((contact) => (
                <Button
                    key={contact.id}
                    variant="ghost"
                    className="w-full justify-start p-4 h-auto hover:bg-slate-50 rounded-lg border border-slate-200 shadow-sm hover:shadow-md"
                >
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center">
                                <Image
                                    src={blo(contact.wallet?.[0]?.address as `0x${string}`)}
                                    alt={contact.wallet?.[0]?.address}
                                    width={40}
                                    height={40}
                                />
                            </div>
                            <div>
                                {contact.email?.[0]?.address && (
                                    <p className="font-medium text-left">
                                        {contact.email[0].address}
                                    </p>
                                )}
                                {contact.wallet?.[0]?.address && (
                                    <p className="text-sm text-gray-500 text-left">
                                        {`${contact.wallet[0].address.slice(0, 6)}...${contact.wallet[0].address.slice(-4)}`}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle send action
                                }}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle request action
                                }}
                            >
                                <HandCoins className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={addingFriend === contact.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!contact.isFriend) {
                                        handleAddFriend(contact.id);
                                    }
                                }}
                            >
                                {contact.isFriend ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </Button>
            ))}
        </div>
    );
} 