"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Account, Email, Friend, Wallet } from "@/types/data";
import Image from "next/image";
import { blo } from "blo";

type ContactListProps = {
    searchQuery?: string;
};

type SearchResult = {
    id: string;
    email: Email[];
    wallet: Wallet[];
};

export function ContactList({ searchQuery }: ContactListProps) {
    const [contacts, setContacts] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchContacts() {
            setLoading(true);
            try {
                if (searchQuery) {
                    // Search for accounts
                    const response = await fetch(`/api/contacts/search?q=${encodeURIComponent(searchQuery)}`);
                    const { data } = await response.json();
                    setContacts(data);
                } else {
                    // Fetch friends list
                    const response = await fetch('/api/contacts/friends');
                    const { data } = await response.json();
                    setContacts(data);
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
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center">
                            <Image src={blo(contact.wallet?.[0]?.address as `0x${string}`)} alt={contact.wallet?.[0]?.address} width={40} height={40} />
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
                </Button>
            ))}
        </div>
    );
} 