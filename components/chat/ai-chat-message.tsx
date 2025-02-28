import { cn } from "@/lib/utils";
import { RefObject } from "react";
import moment from "moment";
import { Message } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "./markdown-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NetworkIcon } from "@/components/network-icon";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useTransactionsStore } from "@/stores/use-transactions-store";
import { useToast } from "@/hooks/use-toast";
import { encodeFunctionData, erc20Abi, parseEther, parseUnits } from "viem";
import { Loader2 } from "lucide-react";

interface TransactionInfo {
    amount: string;
    chain: string;
    chain_id: number;
    to_account_id: string;
    to_address: string;
    token_address: string;
    token_name: string;
    decimals: number;
}

interface AiChatMessagesProps {
    messages: Message[];
    messagesEndRef: RefObject<HTMLDivElement>;
    loading: boolean;
}

export function AiChatMessages({ messages, messagesEndRef, loading }: AiChatMessagesProps) {
    const { wallets } = useWallets();
    const { addTransaction } = useTransactionsStore();
    const { user } = usePrivy();
    const { toast } = useToast();

    const handleSendTransaction = async (txInfo: TransactionInfo) => {
        if (!wallets.length) {
            toast({
                title: "Error",
                description: "No wallet connected",
                variant: "destructive",
            });
            return;
        }

        const wallet = wallets[0];

        try {
            await wallet.switchChain(txInfo.chain_id);
            const provider = await wallet.getEthereumProvider();

            let result;
            if (txInfo.token_address === "0x0000000000000000000000000000000000000000") {
                // Native token transfer
                result = await provider.request({
                    method: "eth_sendTransaction",
                    params: [{
                        to: txInfo.to_address,
                        value: parseEther(txInfo.amount).toString(),
                    }],
                });
            } else {
                // ERC20 token transfer
                const data = encodeFunctionData({
                    abi: erc20Abi,
                    functionName: 'transfer',
                    args: [
                        txInfo.to_address as `0x${string}`,
                        parseUnits(txInfo.amount, txInfo.decimals)
                    ],
                });

                result = await provider.request({
                    method: "eth_sendTransaction",
                    params: [{
                        to: txInfo.token_address,
                        data,
                    }],
                });
            }

            await addTransaction({
                from_account_id: user?.id || "",
                to_account_id: txInfo.to_account_id,
                from_address: wallet.address,
                to_address: txInfo.to_address,
                amount: parseUnits(txInfo.amount, txInfo.decimals).toString(10),
                token_address: txInfo.token_address,
                token_name: txInfo.token_name,
                tx: result,
                transaction_type: "wallet",
                chain_id: txInfo.chain_id,
                chain: txInfo.chain,
                decimals: txInfo.decimals,
            });

            toast({
                title: "Success",
                description: "Transaction sent successfully!",
            });
        } catch (error) {
            console.error("Transaction failed:", error);
            toast({
                variant: "destructive",
                title: "Transaction Failed",
                description: error instanceof Error ? error.message : "Failed to send transaction",
            });
        }
    };

    const renderTransactionCard = (txInfo: TransactionInfo) => {
        return (
            <Card className="bg-secondary border-none shadow-none mt-2">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Send {txInfo.token_name}</p>
                            <p className="text-xs text-muted-foreground">
                                Amount: {txInfo.amount} {txInfo.token_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                To: {txInfo.to_address.slice(0, 6)}...{txInfo.to_address.slice(-4)}
                            </p>
                        </div>
                        <NetworkIcon chain={txInfo.chain} className="h-6 w-6" />
                    </div>
                    <Button
                        className="w-full"
                        onClick={() => handleSendTransaction(txInfo)}
                    >
                        Send Transaction
                    </Button>
                </CardContent>
            </Card>
        );
    };

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
                                {msg.role === "user" ? (
                                    msg.content
                                ) : msg.parts?.some(
                                    part => part.type === "tool-invocation" && part.toolInvocation.toolName === "sendTokenOnUserBehalf" && part.toolInvocation.state === "result"
                                ) ? (
                                    <>
                                        {renderTransactionCard(
                                            msg.parts.find(
                                                part => part.type === "tool-invocation" &&
                                                    part.toolInvocation.toolName === "sendTokenOnUserBehalf"
                                            )?.toolInvocation.result.transaction_info
                                        )}
                                    </>
                                ) : (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={markdownComponents}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                )}
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
            {loading && (
                <div className="flex justify-center items-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}
