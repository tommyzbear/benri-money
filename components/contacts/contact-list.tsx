"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { blo } from "blo";
import { useToast } from "@/hooks/use-toast";

import { Send, Plus, HandCoins, Check } from "lucide-react";
import { SendMoneyDialog } from "@/components/dialogs/send-money-dialog";
import { Contact } from "@/types/data";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestMoneyDialog } from "@/components/dialogs/request-money-dialog";
import { useContactsStore } from "@/stores/use-contacts-store";
import { ChatDialog } from "@/components/chat/chat-dialog";
import { AddFriendDialog } from "@/components/dialogs/add-friend-dialog";
import { usePrivy } from "@privy-io/react-auth";
export function ContactList() {
    const { toast } = useToast();
    const { user } = usePrivy();
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    const [selectedRequestContact, setSelectedRequestContact] = useState<Contact | null>(null);
    const [unfriendingId, setUnfriendingId] = useState<string | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [addFriendOpen, setAddFriendOpen] = useState(false);
    const [selectedAddFriend, setSelectedAddFriend] = useState<Contact | null>(null);
    const {
        friends,
        searchResults,
        searchQuery,
        isLoading,
        error,
        fetchFriends,
        addFriend,
        unfriend,
    } = useContactsStore();
    const displayContacts = searchQuery ? searchResults : friends;

    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

    useEffect(() => {
        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error,
            });
        }
    }, [error, toast]);

    const handleSendClick = (e: React.MouseEvent, contact: Contact) => {
        e.stopPropagation();
        setSelectedContact(contact);
        setSendDialogOpen(true);
    };

    const handleRequestClick = (e: React.MouseEvent, contact: Contact) => {
        e.stopPropagation();
        setSelectedRequestContact(contact);
        setRequestDialogOpen(true);
    };

    const handleUnfriend = async (friendId: string) => {
        setUnfriendingId(friendId);
        try {
            await unfriend(friendId);
            toast({
                title: "Success",
                description: "It's like you never met them in the first place.",
            });
        } catch (error) {
            console.error("Failed to unfriend:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to remove friend. Please try again.",
            });
        } finally {
            setUnfriendingId(null);
        }
    };

    const handleContactClick = (e: React.MouseEvent, contact: Contact) => {
        e.preventDefault();
        setSelectedContact(contact);
        setChatOpen(true);
    };

    const handleAddFriendClick = (e: React.MouseEvent, contact: Contact) => {
        e.stopPropagation();
        setSelectedAddFriend(contact);
        setAddFriendOpen(true);
    };

    const contactListSkeleton = () => {
        return (
            <div className="">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 bg-white border flex items-center justify-between">
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
    };

    return (
        <>
            {isLoading ? (
                contactListSkeleton()
            ) : (
                <div className="">
                    <AnimatePresence>
                        {displayContacts.map((contact, index) => (
                            <motion.div
                                key={contact.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Button
                                    variant="ghost"
                                    className="w-full p-4 h-auto bg-slate-50 hover:bg-slate-100"
                                    onClick={(e) => handleContactClick(e, contact)}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center space-x-4">
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
                                                        {`${contact.wallet.slice(
                                                            0,
                                                            6
                                                        )}...${contact.wallet.slice(-4)}`}
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
                                                onClick={(e) => handleRequestClick(e, contact)}
                                            >
                                                <HandCoins className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (contact.isFriend) {
                                                        handleUnfriend(contact.id);
                                                    } else {
                                                        handleAddFriendClick(e, contact);
                                                    }
                                                }}
                                                disabled={unfriendingId === contact.id}
                                            >
                                                {contact.isFriend ? (
                                                    unfriendingId === contact.id ? (
                                                        <motion.div
                                                            initial={{ scale: 1 }}
                                                            animate={{ scale: 0.8 }}
                                                            transition={{
                                                                repeat: Infinity,
                                                                duration: 0.5,
                                                            }}
                                                        >
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        </motion.div>
                                                    )
                                                ) : (
                                                    <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </motion.div>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {displayContacts.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                            {searchQuery ? "No results found" : "No contacts yet"}
                        </div>
                    )}
                </div>
            )}

            {selectedContact && (
                <ChatDialog open={chatOpen} onOpenChange={setChatOpen} contact={selectedContact} user={user} />
            )}

            <SendMoneyDialog
                open={sendDialogOpen}
                onOpenChange={setSendDialogOpen}
                selectedContact={selectedContact}
            />

            <RequestMoneyDialog
                open={requestDialogOpen}
                onOpenChange={setRequestDialogOpen}
                selectedContact={selectedRequestContact}
            />
        </>
    );
}
