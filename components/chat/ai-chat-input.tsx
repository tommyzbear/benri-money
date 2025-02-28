import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Send } from "lucide-react";

interface AiChatInputProps {
    inputValue: string;
    setInputValue: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSend: (e: React.FormEvent<Element>) => void;
    status: 'submitted' | 'streaming' | 'ready' | 'error';
    startNewChat: () => void;
}

export function AiChatInput({
    inputValue,
    setInputValue,
    handleSend,
    status,
    startNewChat,
}: AiChatInputProps) {
    const handleKeyPress = (e: React.KeyboardEvent<Element>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };
    return (
        <div className="left-0 right-0">
            <div className="w-auto h-fit mx-4 mb-[21px] rounded-3xl bg-secondary flex flex-col p-3 gap-2">
                <div className="flex-1 flex flex-row items-center relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full left-8 bottom-8"
                        onClick={startNewChat}
                    >
                        <RotateCcw className="h-5 w-5" />
                    </Button>
                    <Input
                        value={inputValue}
                        onChange={setInputValue}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        className="rounded-full bg-zinc-100 border-0"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full right-8 bottom-8"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || status === 'submitted' || status === 'streaming'}
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
