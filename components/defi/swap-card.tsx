"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownIcon, RefreshCcw } from "lucide-react";
import { useWalletStore } from "@/stores/use-wallet-store";
import { useToast } from "@/hooks/use-toast";
import { Chain } from "@wagmi/core/chains";

interface SwapCardProps {
    wallet?: string;
    chains: Array<Chain>;
}

export function SwapCard({ wallet, chains }: SwapCardProps) {
    const [fromToken, setFromToken] = useState("");
    const [toToken, setToToken] = useState("");
    const [amount, setAmount] = useState("");
    const [selectedChain, setSelectedChain] = useState(chains[0]?.name);
    const { balances } = useWalletStore();
    const { toast } = useToast();

    const handleSwap = async () => {
        if (!wallet || !amount || !fromToken || !toToken) {
            toast({
                title: "Invalid Input",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Swap Initiated",
            description: "Please approve the transaction in your wallet",
        });

        // Implement actual swap logic here
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Swap Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select value={selectedChain} onValueChange={setSelectedChain}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Chain" />
                    </SelectTrigger>
                    <SelectContent>
                        {chains.map((chain) => (
                            <SelectItem key={chain.id} value={chain.name}>
                                {chain.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="space-y-2">
                    <Input
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                    />
                    <Select value={fromToken} onValueChange={setFromToken}>
                        <SelectTrigger>
                            <SelectValue placeholder="From Token" />
                        </SelectTrigger>
                        <SelectContent>
                            {balances[selectedChain]?.map((token) => (
                                <SelectItem key={token.contractAddress} value={token.contractAddress === "" ? "0x0000000000000000000000000000000000000000" : token.contractAddress}>
                                    {token.symbol}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-center">
                    <Button variant="ghost" size="icon" onClick={() => {
                        const temp = fromToken;
                        setFromToken(toToken);
                        setToToken(temp);
                    }}>
                        <ArrowDownIcon className="h-6 w-6" />
                    </Button>
                </div>

                <div className="space-y-2">
                    <Input placeholder="0.0" disabled value="" />
                    <Select value={toToken} onValueChange={setToToken}>
                        <SelectTrigger>
                            <SelectValue placeholder="To Token" />
                        </SelectTrigger>
                        <SelectContent>
                            {balances[selectedChain]?.map((token) => (
                                <SelectItem key={token.contractAddress} value={token.contractAddress === "" ? "0x0000000000000000000000000000000000000000" : token.contractAddress}>
                                    {token.symbol}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    className="w-full"
                    onClick={handleSwap}
                    disabled={!wallet || !amount || !fromToken || !toToken}
                >
                    Swap
                </Button>
            </CardContent>
        </Card>
    );
} 