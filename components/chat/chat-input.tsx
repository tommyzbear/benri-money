import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Contact } from "@/types/data";
import { Send, Waves, Split } from "lucide-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

interface ChatInputProps {
    inputValue: string;
    setInputValue: (value: string) => void;
    handleSend: () => void;
    handleKeyPress: (e: React.KeyboardEvent) => void;
    setRequestMoneyOpen: (open: boolean) => void;
    setSendMoneyOpen: (open: boolean) => void;
    contact: Contact;
}

export function ChatInput({
    inputValue,
    setInputValue,
    handleSend,
    handleKeyPress,
    setRequestMoneyOpen,
    setSendMoneyOpen,
    contact,
}: ChatInputProps) {
    return (
        <div className="absolute bottom-0 left-0 right-0">
            <div className="w-auto h-fit mx-4 mb-[21px] rounded-3xl bg-secondary flex flex-col p-3 gap-2">
                <div className="h-full flex gap-2 items-center">
                    <Button size="icon" className="ml-auto rounded-full bg-chart-1 text-primary">
                        <Waves className="h-5 w-5" />
                    </Button>
                    <Button size="icon" className="rounded-full bg-chart-1 text-primary">
                        <Split className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        className="flex-1 rounded-full px-5 py-1 font-serif bg-primary-foreground text-primary"
                        onClick={() => setSendMoneyOpen(true)}
                    >
                        <h3 className="w-full text-lg font-libre italic text-left">send</h3>
                    </Button>

                    <Button
                        variant="ghost"
                        className="flex-1 rounded-full px-5 py-1 font-serif bg-chart-1-foreground/80 text-primary-foreground"
                        onClick={() => setRequestMoneyOpen(true)}
                        disabled={!contact.beFriended}
                    >
                        <h3 className="w-full text-lg font-libre italic text-left">request</h3>
                    </Button>
                </div>

                <div className="flex-1 flex flex-row items-center relative">
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Type a message..."
                                className="rounded-full bg-zinc-100 border-0"
                                disabled={!contact.beFriended}
                            />
                        </HoverCardTrigger>
                        {!contact.beFriended && (
                            <HoverCardContent>
                                This user needs to add you as a friend first
                            </HoverCardContent>
                        )}
                    </HoverCard>
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full fixed right-8 bottom-8"
                                onClick={handleSend}
                                disabled={!inputValue.trim() || !contact.beFriended}
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </HoverCardTrigger>
                        {!contact.beFriended && (
                            <HoverCardContent>
                                This user needs to add you as a friend first
                            </HoverCardContent>
                        )}
                    </HoverCard>
                </div>
            </div>
        </div>
    );
}
