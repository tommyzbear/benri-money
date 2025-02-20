import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Waves, Split } from "lucide-react";

interface ChatInputProps {
    inputValue: string;
    setInputValue: (value: string) => void;
    handleSend: () => void;
    handleKeyPress: (e: React.KeyboardEvent) => void;
    setRequestMoneyOpen: (open: boolean) => void;
}

export function ChatInput({
    inputValue,
    setInputValue,
    handleSend,
    handleKeyPress,
    setRequestMoneyOpen,
}: ChatInputProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden">
            <div className="w-auto h-fit mx-4 mb-[21px] rounded-3xl bg-secondary flex flex-col p-3 gap-2">
                <div className="h-full flex gap-2 items-center">
                    <Button
                        variant="ghost"
                        className="flex-1 rounded-full px-5 py-1 font-serif bg-zinc-900 text-primary-foreground"
                        onClick={() => setRequestMoneyOpen(true)}
                    >
                        <h3 className="w-full text-lg font-libre italic text-left">send</h3>
                    </Button>
                    <Button
                        variant="ghost"
                        className="flex-1 rounded-full px-5 py-1 font-serif bg-zinc-900 text-primary-foreground"
                        onClick={() => setRequestMoneyOpen(true)}
                    >
                        <h3 className="w-full text-lg font-libre italic text-left">request</h3>
                    </Button>
                    <Button size="icon" className="ml-auto rounded-full">
                        <Waves className="h-5 w-5" />
                    </Button>
                    <Button size="icon" className="rounded-full">
                        <Split className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex-1 flex flex-row items-center relative">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        className="rounded-full bg-zinc-100 border-0"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full fixed right-8 bottom-8"
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
