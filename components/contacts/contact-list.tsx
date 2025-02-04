"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";
import { blo } from "blo";
import { Send, Plus, HandCoins, Check } from "lucide-react";
import { SendMoneyDialog } from "@/components/dialogs/send-money-dialog";
import { Contact } from "@/types/search";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

function ContactListSkeleton() {
    return (
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-lg border flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

type ContactListProps = {
    searchQuery?: string;
};

export function ContactList({ searchQuery }: ContactListProps) {
    const { toast } = useToast();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingFriend, setAddingFriend] = useState<string | null>(null);
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

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

            setContacts(prevContacts =>
                prevContacts.map(contact =>
                    contact.id === contactId
                        ? { ...contact, isFriend: true }
                        : contact
                )
            );
        } catch (error) {
            console.error('Error adding friend:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to add friend. Please try again.",
            });
        } finally {
            setAddingFriend(null);
        }
    };

    const handleSendClick = (e: React.MouseEvent, contact: Contact) => {
        e.stopPropagation();
        setSelectedContact(contact);
        setSendDialogOpen(true);
    };

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                setLoading(true);
                if (searchQuery) {
                    const response = await fetch(`/api/contacts/search?q=${encodeURIComponent(searchQuery)}`);
                    const { data } = await response.json();
                    setContacts(data);

                    if (!response.ok) {
                        throw new Error('Failed to fetch contacts');
                    }
                } else {
                    const response = await fetch('/api/contacts/friends');
                    const { data } = await response.json();
                    setContacts(data.map(contact => ({ ...contact, isFriend: true })));

                    if (!response.ok) {
                        throw new Error('Failed to fetch friends');
                    }
                }
            } catch (error) {
                console.error('Error fetching contacts:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load contacts. Please try again.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, [searchQuery, toast]);

    if (loading) {
        return <ContactListSkeleton />;
    }

    return (
        <>
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
                                        src={blo(contact.wallet as `0x${string}`)}
                                        alt={contact.wallet}
                                        width={40}
                                        height={40}
                                    />
                                </div>
                                <div>
                                    {contact.email && (
                                        <p className="font-medium text-left">
                                            {contact.email}
                                        </p>
                                    )}
                                    {contact.wallet && (
                                        <p className="text-sm text-gray-500 text-left">
                                            {`${contact.wallet.slice(0, 6)}...${contact.wallet.slice(-4)}`}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => handleSendClick(e, contact)}
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

            <SendMoneyDialog
                open={sendDialogOpen}
                onOpenChange={setSendDialogOpen}
                selectedContact={selectedContact}
            />
        </>
    );
} 