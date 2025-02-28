"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { User } from "@privy-io/react-auth";
import { useToast } from "@/hooks/use-toast";
import { useChat, Message as AiMessage } from "@ai-sdk/react";
import { AiChatMessages } from "./ai-chat-message";
import { AiChatInput } from "./ai-chat-input";
interface AiChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
    sessionName: string;
    setSessionName: (name: string) => void;
    sessionId: string;
    addSession: (sessionId: string, sessionName: string) => void;
    startNewChat: () => void;
}

export function AiChatDialog({ open, onOpenChange, sessionName, setSessionName, sessionId, addSession, startNewChat }: AiChatDialogProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const { messages, input, handleInputChange, handleSubmit, setInput, status } = useChat({
        api: "/api/chat",
        maxSteps: 5,
        id: sessionId,
        onFinish: async (message) => {
            console.log("message", message);
            try {
                await fetch("/api/chat/message", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        session_id: sessionId,
                        session_name: sessionName,
                        role: "assistant",
                        content: message,
                    }),
                });
            } catch (error) {
                console.error(`Failed to save assistant message:`, error);
            }
        },
        onError: (error) => {
            console.error("Chat error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to process your request",
            });
        },
        onToolCall: (toolCall) => {
            console.log("toolCall", toolCall);
        },
    });

    // useEffect(() => {
    //     const fetchMessages = async () => {
    //         try {
    //             const response = await fetch(`/api/chat/sessions/${sessionId}`);
    //             if (!response.ok) throw new Error("Failed to fetch session messages");
    //             const messages = await response.json();
    //             setMessages(messages);
    //         } catch (error) {
    //             console.error("Error fetching session messages:", error);
    //         }
    //     };
    //     fetchMessages();
    // }, [sessionId, setMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleMessageSubmit = async (e: React.FormEvent<Element>) => {
        e.preventDefault();
        const currentSessionName = sessionName === "" ? input.substring(0, 35) : "";

        // first message
        if (sessionName === "") {
            setSessionName(input.substring(0, 35));
            addSession(sessionId, currentSessionName);
        }

        try {
            await fetch("/api/chat/message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    session_name: currentSessionName,
                    role: "user",
                    content: {
                        role: "user",
                        content: input,
                    } as AiMessage,
                }),
            });
        } catch (error) {
            console.error(`Failed to save user message:`, error);
        }

        // Process the message
        handleSubmit(e);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className={cn(
                        "sm:max-w-[1024px] [&>button]:hidden",
                        "h-[100dvh]",
                        "p-0 px-4",
                        "gap-0",
                        "border-0",
                        "sm:bg-transparent bg-background",
                        "transition-all",
                        "data-[state=open]:animate-in",
                        "data-[state=closed]:animate-out",
                        "data-[state=open]:slide-in-from-right",
                        "data-[state=closed]:slide-out-to-right",
                        "!duration-300"
                    )}
                >
                    <DialogTitle className="hidden">{"Benri AI"}</DialogTitle>
                    <div
                        className={cn(
                            "flex flex-col h-[calc(100vh-12.5rem)]",
                            "mt-14 rounded-4xl rounded-tl-2xl bg-white overflow-hidden"
                        )}
                    >
                        <header className="flex items-center justify-start bg-primary p-2 z-10 gap-3 h-16">
                            <Button
                                size="icon"
                                className="rounded-xl bg-secondary w-5 h-full"
                                onClick={() => onOpenChange(false)}
                            >
                                <ChevronLeft className="h-5 w-5" stroke="black" />
                            </Button>
                            <div className="flex items-center ml-3 h-full gap-3">
                                <Image
                                    src="/educative.svg"
                                    width={35}
                                    height={35}
                                    alt={"Benri AI"}
                                    className="h-full w-auto antialiased rounded-full bg-white"
                                />
                                <div className="">
                                    <h2 className="font-libre font-semibold italic text-white text-lg pl-1">
                                        {"Benri AI"}
                                    </h2>
                                    <p className="text-xs text-secondary">
                                        {`@Benri AI`}
                                    </p>
                                </div>
                            </div>
                        </header>

                        <AiChatMessages
                            messages={messages}
                            messagesEndRef={messagesEndRef}
                            loading={status === 'submitted'}
                            setInput={setInput}
                        />

                        <AiChatInput
                            inputValue={input}
                            setInputValue={handleInputChange}
                            handleSend={handleMessageSubmit}
                            status={status}
                            startNewChat={startNewChat}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
