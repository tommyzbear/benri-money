"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types/data";
import { Skeleton } from "@/components/ui/skeleton";
import { useContactsStore } from "@/stores/use-contacts-store";
import { usePrivy } from "@privy-io/react-auth";
import { AnimatePresence } from "framer-motion";
import { SendMoneyDialog } from "@/components/dialogs/send-money-dialog";
import { RequestMoneyDialog } from "@/components/dialogs/request-money-dialog";
import { ChatDialog } from "@/components/chat/chat-dialog";
import { ContactCard } from "./contact-card";
import { ProfileImgMask } from "../profile/profile-img-mask";
import { AiCard } from "./ai-card";
import { AiChatDialog } from "../chat/ai-chat-dialog";
import { useAiChatStore } from "@/stores/use-ai-chat-store";
interface ContactListProps {
    friendSearchQuery: string;
}

export function ContactList({ friendSearchQuery }: ContactListProps) {
    const { toast } = useToast();
    const { user } = usePrivy();
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    const [selectedRequestContact, setSelectedRequestContact] = useState<Contact | null>(null);
    const [unfriendingId, setUnfriendingId] = useState<string | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [aiChatOpen, setAiChatOpen] = useState(false);
    const { sessionName, setSessionName, startNewChat, fetchSessions, sessionId, addSession } = useAiChatStore();
    const [addFriendOpen, setAddFriendOpen] = useState(false);
    const [selectedAddFriend, setSelectedAddFriend] = useState<Contact | null>(null);

    const { friends, isLoading, error, fetchFriends, unfriend } = useContactsStore();

    const filteredFriends = friendSearchQuery
        ? friends.filter(
            (friend) =>
                friend.username?.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
                friend.email?.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
                friend.wallet?.toLowerCase().includes(friendSearchQuery.toLowerCase())
        )
        : friends;

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
                {[...Array(7)].map((_, i) => (
                    <div
                        key={i}
                        className="h-20 p-4 bg-white border flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-4">
                            <ProfileImgMask fill="#e5e7eb" className="antialiased h-12 w-12" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <AiCard onClick={() => setAiChatOpen(true)} />
            {isLoading ? (
                contactListSkeleton()
            ) : (
                <>
                    <AnimatePresence>
                        {filteredFriends.map((contact, index) => (
                            <ContactCard
                                key={contact.id}
                                contact={contact}
                                index={index}
                                unfriendingId={unfriendingId}
                                onContactClick={(e) => handleContactClick(e, contact)}
                                onUnfriendClick={(e) => handleUnfriend(contact.id)}
                                onAddFriendClick={(e) => handleAddFriendClick(e, contact)}
                            />
                        ))}
                    </AnimatePresence>

                    {filteredFriends.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                            {friendSearchQuery ? "No results found" : "No contacts yet"}
                        </div>
                    )}
                </>
            )}

            {selectedContact && user && (
                <ChatDialog
                    open={chatOpen}
                    onOpenChange={setChatOpen}
                    contact={selectedContact}
                    user={user}
                />
            )}

            <AiChatDialog
                open={aiChatOpen}
                onOpenChange={setAiChatOpen}
                user={user}
                sessionName={sessionName}
                setSessionName={setSessionName}
                sessionId={sessionId}
                addSession={addSession}
            />

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
