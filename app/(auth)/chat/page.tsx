"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, usePresence, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Message } from "@/types/data";

export default function ChatPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);

    const [isPresent, safeToRemove] = usePresence();
    const [isExiting, setIsExiting] = useState(false);

    const handleBack = useCallback(() => {
        setIsExiting(true);
    }, []);

    const handleAnimationComplete = useCallback(() => {
        if (isExiting) {
            router.back();
        }
    }, [isExiting, router]);

    useEffect(() => {
        if (!isPresent) {
            setTimeout(safeToRemove, 1000);
        }
    }, [isPresent, safeToRemove]);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: isExiting ? "100%" : 0 }}
                exit={{ x: "100%" }}
                transition={{
                    type: "spring",
                    damping: 25, // Controls how quickly the animation stops (higher = faster stop)
                    stiffness: 120, // Controls the speed (higher = faster animation)
                    mass: 0.8, // Controls the weight (lower = faster movement)
                    duration: 0.2, // Sets a fixed duration in seconds
                }}
                onAnimationComplete={handleAnimationComplete}
                className="fixed inset-0 px-4 bg-background z-20"
            >
                <div className="flex flex-col h-[calc(100vh-12.5rem)] mt-14 overflow-y-auto rounded-3xl bg-secondary">
                    <header className="flex items-center justify-between bg-primary">
                        <div className="flex flex-row justify-between items-center gap-2">
                            <Button size="icon" className="rounded-full" onClick={handleBack}>
                                <ChevronLeft />
                            </Button>
                        </div>
                    </header>
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto ">
                        <div className="text-center text-sm text-zinc-500 my-2">
                            Today, 21st Jan
                        </div>
                        {messages.map((msg, index) => {
                            const prevMsg = index > 0 ? messages[index - 1] : null;
                            const nextMsg =
                                index < messages.length - 1 ? messages[index + 1] : null;
                            const showTime =
                                !prevMsg ||
                                new Date(prevMsg.timestamp).setSeconds(0) !==
                                new Date(msg.timestamp).setSeconds(0) ||
                                prevMsg.sender !== msg.sender;
                            const isStacked = !showTime && prevMsg?.sender === msg.sender;
                            const isLastInStack =
                                !nextMsg ||
                                new Date(nextMsg.timestamp).setSeconds(0) !==
                                new Date(msg.timestamp).setSeconds(0) ||
                                nextMsg.sender !== msg.sender;

                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex flex-col max-w-[80%]",
                                        msg.sender === "user" ? "ml-auto items-end" : "items-start",
                                        isStacked ? "-mt-3" : ""
                                    )}
                                >
                                    {msg.type === "payment" || msg.type === "request" ? (
                                        <div className="bg-zinc-600 text-white p-4 rounded-2xl">
                                            <p className="font-serif italic text-sm">
                                                {msg.sender === "other"
                                                    ? "yhigor sent"
                                                    : "you requested"}
                                            </p>
                                            <p className="font-serif text-xl">${msg.amount}</p>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-3xl px-4 py-2 shadow-sm">
                                            {msg.content}
                                        </div>
                                    )}
                                    {(showTime || isLastInStack) && (
                                        <span className="text-xs text-zinc-500 mt-1">
                                            {msg.timestamp.toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 lg:hidden">
                        <div className="w-auto h-24 mx-4 mb-[21px] rounded-3xl bg-secondary flex flex-col p-3">
                            <div className="flex gap-2 items-center">
                                <Button
                                    variant="ghost"
                                    className="rounded-full px-6 py-2 font-serif bg-zinc-900 text-white hover:bg-zinc-800"
                                >
                                    send
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="rounded-full px-6 py-2 font-serif bg-zinc-900 text-white hover:bg-zinc-800"
                                >
                                    request
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-auto rounded-full"
                                >
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M3 12h18M3 6h18M3 18h18" />
                                    </svg>
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Button>
                            </div>
                            <Input
                                className="mt-2 rounded-full bg-zinc-100 border-0"
                                placeholder=""
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
