import { cn } from "@/lib/utils";
import { RefObject } from "react";
import Image from "next/image";
import { formatValue } from "@/lib/utils";
import moment from "moment";
import { ChatMessage } from "@/types/chat";
interface ChatMessagesProps {
    messages: ChatMessage[];
    contact: {
        username: string;
    };
    messagesEndRef: RefObject<HTMLDivElement>;
}

export function ChatMessages({ messages, contact, messagesEndRef }: ChatMessagesProps) {
    const renderDate = (timestamp: Date) => {
        return (
            <div className="text-center text-sm text-zinc-500 my-2">{moment(timestamp).format("MMM D, YYYY")}</div>
        );
    };

    const renderMessage = (msg: ChatMessage) => {
        switch (msg.type) {
            case "payment":
                return (
                    <div className="bg-zinc-600 text-white p-6 rounded-4xl text-center">
                        <h4 className="font-libre italic text-base">
                            {msg.sender !== "user" ? `${contact.username} sent` : "you sent"}
                        </h4>
                        <div className="w-20 h-20 p-3 mx-auto">
                            <Image
                                src="/coin-rotate-temp.gif"
                                alt="benri star"
                                width={100}
                                height={100}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <p className="font-libre text-xl">{formatValue(Number(msg.amount))}</p>
                    </div>
                );
            case "request":
                return (
                    <div className="bg-zinc-600 text-white p-6 rounded-4xl text-center">
                        <h4 className="font-libre italic text-base">
                            {msg.sender !== "user" ? `${contact.username} requested` : "you requested"}
                        </h4>
                        <div className="w-20 h-20 p-3 mx-auto">
                            <Image
                                src="/coin-rotate-temp.gif"
                                alt="benri star"
                                width={100}
                                height={100}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <p className="font-libre text-xl">{formatValue(Number(msg.amount))}</p>
                    </div>
                );
            case "message":
                return (
                    <div
                        className={cn(
                            "bg-white rounded-2xl px-4 my-1 py-1 text-base",
                            msg.sender === "user" ? "bg-muted" : "bg-secondary text-primary"
                        )}
                    >
                        {msg.content}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => {
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

                const showDate = !prevMsg || !moment(prevMsg.timestamp).isSame(msg.timestamp, "date");
                const isLastInStack =
                    !nextMsg ||
                    !moment(nextMsg.timestamp).isSame(msg.timestamp, "minute") ||
                    nextMsg.sender !== msg.sender;

                return (
                    <div key={msg.id}>
                        {showDate && renderDate(msg.timestamp)}
                        <div
                            className={cn(
                                "flex flex-col max-w-[80%] gap-0 tracking-tight",
                                msg.sender === "user" ? "ml-auto items-end" : "items-start"
                            )}
                        >
                            {renderMessage(msg)}
                            {isLastInStack && (
                                <span className="text-xs text-zinc-500 mt-2 tracking-tighter px-3 pb-3">
                                    {moment(msg.timestamp).format("h:mm a")}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
}
