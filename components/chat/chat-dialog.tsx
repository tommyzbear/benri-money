"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Contact, Message } from "@/types/data";
import Image from "next/image";
import { blo } from "blo";
import { SendMoneyDialog } from "@/components/dialogs/send-money-dialog";
import { RequestMoneyDialog } from "@/components/dialogs/request-money-dialog";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { User } from "@privy-io/server-auth";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/types/chat";

interface ChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contact: Contact;
    user: User;
}

export function ChatDialog({ open, onOpenChange, contact, user }: ChatDialogProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [sendMoneyOpen, setSendMoneyOpen] = useState(false);
    const [requestMoneyOpen, setRequestMoneyOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            if (!user?.id || !contact.id) return;

            try {
                const response = await fetch(`/api/contacts/chat?sender=${user.id}&receiver=${contact.id}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch messages');
                }

                const data = await response.json();

                // Transform the messages to match the expected format
                const formattedMessages: ChatMessage[] = data.messages.map((msg: Message) => ({
                    id: msg.id.toString(),
                    content: msg.content || "",
                    sender: msg.sender === user.id ? "user" : "other",
                    timestamp: msg.sent_at,
                    amount: msg.amount ? Number(msg.amount) : undefined,
                    type: msg.message_type
                }));

                setMessages(formattedMessages);
            } catch (error) {
                console.error('Error fetching messages:', error);
                toast({
                    title: "Error fetching messages",
                    description: "Please try again later",
                    variant: "destructive",
                });
            }
        };

        fetchMessages();
    }, [user?.id, contact.id, toast]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const newMessage: Omit<Message, "id" | "sent_at" | "transaction_id" | "payment_request_id"> = {
            content: inputValue.trim(),
            sender: user.id,
            receiver: contact.id,
            message_type: "message",
            amount: BigInt(0),
        };
        setInputValue("");

        try {
            const response = await fetch("/api/contacts/chat", {
                method: "POST",
                body: JSON.stringify(newMessage),
            });

            if (response.ok) {
                const data = await response.json();
                const convertedMessage = {
                    id: data.message.id.toString(),
                    content: data.message.content || "",
                    sender: data.message.sender === user.id ? "user" : "other",
                    timestamp: data.message.sent_at,
                    amount: data.message.amount ? Number(data.message.amount) : undefined,
                    type: data.message.message_type
                } as ChatMessage;

                setMessages((prev) => [...prev, convertedMessage]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast({
                title: "Error sending message",
                description: "Please try again later",
                variant: "destructive",
            });
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className={cn(
                        "sm:max-w-[425px]",
                        "h-[100dvh]",
                        "p-0",
                        "gap-0",
                        "border-0",
                        "px-4",
                        "bg-background",
                        "transition-all",
                        "data-[state=open]:animate-in",
                        "data-[state=closed]:animate-out",
                        "data-[state=open]:slide-in-from-right",
                        "data-[state=closed]:slide-out-to-right",
                        "!duration-300"
                    )}
                >
                    <DialogTitle className="hidden">{contact.username}</DialogTitle>
                    <div className="flex flex-col h-[calc(100vh-12.5rem)] mt-14 rounded-5xl rounded-tl-2xl bg-white overflow-hidden">
                        <header className="flex items-center justify-start bg-primary p-2 z-10 gap-3 h-18">
                            <Button
                                size="icon"
                                className="rounded-xl bg-primary-foreground w-5 h-full"
                                onClick={() => onOpenChange(false)}
                            >
                                <ChevronLeft className="h-5 w-5" stroke="black" />
                            </Button>
                            <div className="flex items-center ml-4 h-full gap-3">
                                <Image
                                    src={contact.profileImg || blo(contact.wallet as `0x${string}`)}
                                    width={40}
                                    height={40}
                                    alt={contact.username || "Contact profile"}
                                    className="h-full w-auto antialiased rounded-full"
                                />
                                <div className="">
                                    <h2 className="font-libre font-semibold italic text-primary-foreground text-lg pl-1">
                                        {contact.username}
                                    </h2>
                                    <p className="text-xs text-secondary">
                                        {`@ ${contact.wallet?.slice(
                                            0,
                                            6
                                        )}...${contact.wallet?.slice(-4)}`}
                                    </p>
                                </div>
                            </div>
                        </header>

                        <ChatMessages
                            messages={messages}
                            contact={contact}
                            messagesEndRef={messagesEndRef}
                        />
                        <ChatInput
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            handleSend={handleSend}
                            handleKeyPress={handleKeyPress}
                            setRequestMoneyOpen={setRequestMoneyOpen}
                            setSendMoneyOpen={setSendMoneyOpen}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <SendMoneyDialog
                open={sendMoneyOpen}
                onOpenChange={setSendMoneyOpen}
                selectedContact={contact}
            />

            <RequestMoneyDialog
                open={requestMoneyOpen}
                onOpenChange={setRequestMoneyOpen}
                selectedContact={contact}
            />
        </>
    );
}
