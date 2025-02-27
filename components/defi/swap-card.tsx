"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowDownIcon } from "lucide-react";
import { useWalletStore } from "@/stores/use-wallet-store";
import { useToast } from "@/hooks/use-toast";
import { Chain } from "@wagmi/core/chains";
import { OdosAssembledTransaction, OdosQuoteResponse } from "@/types/odos_types";
import { ConnectedWallet } from "@privy-io/react-auth";
import { encodeFunctionData } from "viem";
import { erc20Abi } from "viem";
import { odosClient } from "@/app/services/odos";
import { TokenData } from "@/app/services/alchemy";
import { ethers } from "ethers";

interface SwapCardProps {
    wallet?: ConnectedWallet;
    chains: ReadonlyArray<Chain>;
}

export function SwapCard({ wallet, chains }: SwapCardProps) {
    const [fromToken, setFromToken] = useState<TokenData | null>(null);
    const [toToken, setToToken] = useState<TokenData | null>(null);
    const [amount, setAmount] = useState("");
    const [approved, setApproved] = useState(true);
    const [quote, setQuote] = useState<OdosQuoteResponse | null>(null);
    const [selectedChain, setSelectedChain] = useState<Chain>(chains[0]);
    const { balances } = useWalletStore();
    const { toast } = useToast();

    const handleQuote = async () => {
        if (!wallet || !amount || !fromToken || !toToken) {
            toast({
                title: "Invalid Input",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        const quote = await fetch("/api/swap/quote", {
            method: "POST",
            body: JSON.stringify({
                chainId: selectedChain.id,
                inputToken: {
                    tokenAddress:
                        fromToken.contractAddress === ""
                            ? "0x0000000000000000000000000000000000000000"
                            : fromToken.contractAddress,
                    amount: ethers.utils.parseUnits(amount, fromToken.decimals).toString(),
                },
                outputToken: {
                    tokenAddress:
                        toToken.contractAddress === ""
                            ? "0x0000000000000000000000000000000000000000"
                            : toToken.contractAddress,
                    proportion: 1,
                },
                userAddr: wallet.address,
            }),
        });

        if (!quote.ok) {
            toast({
                title: "Error",
                description: "Failed to get quote",
                variant: "destructive",
            });
            return;
        }

        const data: OdosQuoteResponse = await quote.json();
        console.log("Quote", data);

        setQuote(data);
        toast({
            title: "Quoted",
            description: "Please proceed with the swap",
        });
    };

    useEffect(() => {
        const checkApproved = async () => {
            if (!wallet || !fromToken || !selectedChain) return;

            if (fromToken.contractAddress === "") {
                setApproved(true);
                return;
            }

            const provider = await wallet.getEthereumProvider();
            const spenderAddress =
                selectedChain.id === 1
                    ? odosClient.routerAddressByChain["eip155:1"]
                    : selectedChain.id === 137
                    ? odosClient.routerAddressByChain["eip155:137"]
                    : selectedChain.id === 8453
                    ? odosClient.routerAddressByChain["eip155:8453"]
                    : "";

            if (!spenderAddress) {
                toast({
                    title: "Unsupported Chain",
                    description: "Unsupported chain",
                    variant: "destructive",
                });
                return;
            }

            const data = encodeFunctionData({
                abi: erc20Abi,
                functionName: "allowance",
                args: [wallet?.address as `0x${string}`, spenderAddress],
            });

            const result = await provider?.request({
                method: "eth_call",
                params: [
                    {
                        to: fromToken?.contractAddress,
                        data: data,
                        value: "0x0",
                    },
                ],
            });

            if (amount) {
                console.log("result", result);
                const allowance = ethers.utils
                    .parseUnits(amount, fromToken?.decimals || 18)
                    .toBigInt();
                if (BigInt(result) < allowance) {
                    setApproved(false);
                } else {
                    setApproved(true);
                }
            }
        };

        checkApproved();
    }, [approved, wallet, fromToken, selectedChain, amount]);

    const handleApprove = async () => {
        const provider = await wallet?.getEthereumProvider();

        const spenderAddress =
            selectedChain.id === 1
                ? odosClient.routerAddressByChain["eip155:1"]
                : selectedChain.id === 137
                ? odosClient.routerAddressByChain["eip155:137"]
                : selectedChain.id === 8453
                ? odosClient.routerAddressByChain["eip155:8453"]
                : "";

        if (!spenderAddress) {
            toast({
                title: "Unsupported Chain",
                description: "Unsupported chain",
                variant: "destructive",
            });
            return;
        }

        const data = encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [
                spenderAddress,
                ethers.utils.parseUnits(amount, fromToken?.decimals || 18).toBigInt(),
            ],
        });

        const result = await provider?.request({
            method: "eth_sendTransaction",
            params: [
                {
                    to: fromToken?.contractAddress,
                    data: data,
                    value: "0x0",
                },
            ],
        });

        console.log("Approved tx", result);

        setApproved(true);
        toast({
            title: "Approved",
            description: "Approved token spending in your wallet",
        });
    };

    const handleSwap = async () => {
        if (!wallet || !amount || !fromToken || !toToken) {
            toast({
                title: "Invalid Input",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        const assembledTransaction = await fetch("/api/swap/assembleTx", {
            method: "POST",
            body: JSON.stringify({ pathId: quote?.pathId, userAddr: wallet.address }),
        });

        if (!assembledTransaction.ok) {
            toast({
                title: "Error",
                description: "Failed to assemble transaction",
                variant: "destructive",
            });
            return;
        }

        const data: OdosAssembledTransaction = await assembledTransaction.json();

        const provider = await wallet?.getEthereumProvider();

        const result = await provider?.request({
            method: "eth_sendTransaction",
            params: [
                {
                    ...data.transaction,
                },
            ],
        });

        console.log("Swap tx", result);

        toast({
            title: "Swap Successful",
            description: `${result?.transactionHash}`,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Swap Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select
                    value={selectedChain.name}
                    onValueChange={(value) =>
                        setSelectedChain(chains.find((chain) => chain.name === value) || chains[0])
                    }
                >
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
                    <Select
                        value={fromToken?.symbol}
                        onValueChange={(value) =>
                            setFromToken(
                                balances[selectedChain.name]?.find(
                                    (token) => token.symbol === value
                                ) || null
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="From Token" />
                        </SelectTrigger>
                        <SelectContent>
                            {balances[selectedChain.name]?.map((token) => (
                                <SelectItem key={token.contractAddress} value={token.symbol}>
                                    {token.symbol}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            const temp = fromToken;
                            setFromToken(toToken);
                            setToToken(temp);
                        }}
                    >
                        <ArrowDownIcon className="h-6 w-6" />
                    </Button>
                </div>

                <div className="space-y-2">
                    <Input placeholder="0.0" disabled value="" />
                    <Select
                        value={toToken?.symbol}
                        onValueChange={(value) =>
                            setToToken(
                                balances[selectedChain.name]?.find(
                                    (token) => token.symbol === value
                                ) || null
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="To Token" />
                        </SelectTrigger>
                        <SelectContent>
                            {balances[selectedChain.name]?.map(
                                (token) =>
                                    token.symbol !== fromToken?.symbol && (
                                        <SelectItem
                                            key={token.contractAddress}
                                            value={token.symbol}
                                        >
                                            {token.symbol}
                                        </SelectItem>
                                    )
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {approved ? (
                    quote === null ? (
                        <Button
                            className="w-full"
                            onClick={handleQuote}
                            disabled={!wallet || !amount || !fromToken || !toToken}
                        >
                            Quote
                        </Button>
                    ) : (
                        <Button
                            className="w-full"
                            onClick={handleSwap}
                            disabled={!wallet || !amount || !fromToken || !toToken}
                        >
                            Swap
                        </Button>
                    )
                ) : (
                    <Button className="w-full" onClick={handleApprove}>
                        Approve
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
