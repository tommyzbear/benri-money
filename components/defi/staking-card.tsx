"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWalletStore } from "@/stores/use-wallet-store";
import { useToast } from "@/hooks/use-toast";

interface StakingCardProps {
    wallet?: string;
    chains: Array<{ name: string; id: number }>;
}

export function StakingCard({ wallet, chains }: StakingCardProps) {
    const [selectedChain, setSelectedChain] = useState(chains[0]?.name);
    const [amount, setAmount] = useState("");
    const [selectedToken, setSelectedToken] = useState("");
    const { balances } = useWalletStore();
    const { toast } = useToast();

    const handleStake = async () => {
        if (!wallet || !amount || !selectedToken) {
            toast({
                title: "Invalid Input",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Staking Initiated",
            description: "Please approve the transaction in your wallet",
        });

        // Implement actual staking logic here
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stake Tokens</CardTitle>
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
                    <Select value={selectedToken} onValueChange={setSelectedToken}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Token" />
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

                <div className="rounded-lg bg-secondary p-4 space-y-2">
                    <div className="flex justify-between">
                        <span>APY</span>
                        <span>5.2%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Lock Period</span>
                        <span>30 days</span>
                    </div>
                </div>

                <Button
                    className="w-full"
                    onClick={handleStake}
                    disabled={!wallet || !amount || !selectedToken}
                >
                    Stake
                </Button>
            </CardContent>
        </Card>
    );
} 