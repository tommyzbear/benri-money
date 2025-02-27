import { cn } from "@/lib/utils";
import { RefObject } from "react";
import moment from "moment";
import { Message } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "./markdown-components";

interface AiChatMessagesProps {
    messages: Message[];
    messagesEndRef: RefObject<HTMLDivElement>;
}

export function AiChatMessages({ messages, messagesEndRef }: AiChatMessagesProps) {
    const renderDate = (timestamp: Date) => {
        return (
            <div className="text-center text-sm text-zinc-500 my-2">{moment(timestamp).format("MMM D, YYYY")}</div>
        );
    };

    return (
        <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => {
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

                const showDate = !prevMsg || !moment(prevMsg.createdAt).isSame(msg.createdAt, "date");
                const isLastInStack =
                    !nextMsg ||
                    !moment(nextMsg.createdAt).isSame(msg.createdAt, "minute") ||
                    nextMsg.role !== msg.role;

                return (
                    <div key={msg.id}>
                        {showDate && renderDate(msg.createdAt ?? new Date())}
                        <div
                            className={cn(
                                "flex flex-col max-w-[80%] gap-0 tracking-tight",
                                msg.role === "user" ? "ml-auto items-end" : "items-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "bg-white rounded-2xl px-4 my-1 py-1 text-base",
                                    msg.role === "user" ? "bg-muted" : "bg-secondary text-primary"
                                )}
                            >
                                {msg.role === "user"
                                    ? msg.content
                                    : <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={markdownComponents}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>}
                            </div>
                            {isLastInStack && (
                                <span className="text-xs text-zinc-500 mt-2 tracking-tighter px-3 pb-3">
                                    {moment(msg.createdAt).format("h:mm a")}
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
