"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { Contact } from "@/types/data";
import Image from "next/image";
import { blo } from "blo";
import { SendMoneyDialog } from "@/components/dialogs/send-money-dialog";
import { RequestMoneyDialog } from "@/components/dialogs/request-money-dialog";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";

interface ChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contact: Contact;
}

export function ChatDialog({ open, onOpenChange, contact }: ChatDialogProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [sendMoneyOpen, setSendMoneyOpen] = useState(false);
    const [requestMoneyOpen, setRequestMoneyOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (open) {
            setMessages([
                // Example messages for testing
                {
                    id: "1",
                    content: "",
                    sender: "other",
                    timestamp: new Date("2024-01-01T12:36:00"),
                    amount: 4200.69,
                    type: "payment",
                },
                {
                    id: "2",
                    content: "",
                    sender: "user",
                    timestamp: new Date("2024-01-01T12:36:00"),
                    amount: 420000000.69,
                    type: "request",
                },
                {
                    id: "3",
                    content: "bro where the fuq are you",
                    sender: "user",
                    timestamp: new Date("2024-01-01T14:36:00"),
                    type: "message",
                },
                {
                    id: "4",
                    content: "ayoooo0000oo",
                    sender: "user",
                    timestamp: new Date("2024-01-21T14:36:00"),
                    type: "message",
                },
                {
                    id: "5",
                    content: "send me sum fucking money now u bitch",
                    sender: "user",
                    timestamp: new Date("2024-01-21T14:38:00"),
                    type: "message",
                },
                {
                    id: "6",
                    content: "hey wtf bro",
                    sender: "user",
                    timestamp: new Date("2024-02-21T14:36:00"),
                    type: "message",
                },
                {
                    id: "7",
                    content: "chill out man, I was in a meeting",
                    sender: "other",
                    timestamp: new Date("2024-02-21T15:00:00"),
                    type: "message",
                },
                {
                    id: "8",
                    content: "here's some cash to calm you down",
                    sender: "other",
                    timestamp: new Date("2024-02-21T15:00:30"),
                    type: "message",
                },
                {
                    id: "9",
                    content: "",
                    sender: "other",
                    timestamp: new Date("2024-02-21T15:01:00"),
                    amount: 1000,
                    type: "payment",
                },
                {
                    id: "10",
                    content: "thanks g",
                    sender: "user",
                    timestamp: new Date("2024-02-23T15:02:00"),
                    type: "message",
                },
                {
                    id: "11",
                    content: "but I need more tho",
                    sender: "user",
                    timestamp: new Date("2024-02-23T15:02:10"),
                    type: "message",
                },
                {
                    id: "12",
                    content: "for reasons...",
                    sender: "user",
                    timestamp: new Date("2024-02-23T15:02:15"),
                    type: "message",
                },
            ]);
        }
    }, [open]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            content: inputValue.trim(),
            sender: "user",
            timestamp: new Date(),
            type: "message",
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue("");
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
