"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
import { odosClient } from "@/services/odos";
import { TokenData } from "@/services/alchemy";
import { ethers } from "ethers";
import debounce from "lodash/debounce";

interface SwapCardProps {
    wallet?: ConnectedWallet;
    chains: Array<Chain>;
    onTransactionSuccess?: () => void;
}

export function SwapCard({ wallet, chains, onTransactionSuccess }: SwapCardProps) {
    const [fromToken, setFromToken] = useState<TokenData | null>(null);
    const [toToken, setToToken] = useState<TokenData | null>(null);
    const [amount, setAmount] = useState("");
    const [approved, setApproved] = useState(true);
    const [assembledTransaction, setAssembledTransaction] = useState<OdosAssembledTransaction | null>(null);
    const [selectedChain, setSelectedChain] = useState<Chain>(chains[0]);
    const { balances } = useWalletStore();
    const { toast } = useToast();

    const handleQuote = useCallback(async (value: string) => {
        if (!wallet || !value || !fromToken || !toToken) {
            return;
        }

        try {
            const quote = await fetch("/api/swap/quote", {
                method: "POST",
                body: JSON.stringify({
                    chainId: selectedChain.id,
                    inputToken: {
                        tokenAddress:
                            fromToken.contractAddress === ""
                                ? "0x0000000000000000000000000000000000000000"
                                : fromToken.contractAddress,
                        amount: ethers.utils.parseUnits(value, fromToken.decimals).toString(),
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
                throw new Error("Failed to get quote");
            }

            const data: OdosQuoteResponse = await quote.json();

            const assembledTransaction = await fetch("/api/swap/assembleTx", {
                method: "POST",
                body: JSON.stringify({ pathId: data?.pathId, userAddr: wallet.address }),
            });

            if (!assembledTransaction.ok) {
                throw new Error("Failed to assemble transaction");
            }

            const assembledTransactionData: OdosAssembledTransaction = await assembledTransaction.json();

            setAssembledTransaction(assembledTransactionData);

            toast({
                title: "Quoted",
                description: "Please proceed with the swap",
            });
        } catch (error) {
            console.error("Error getting quote:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to get quote",
                variant: "destructive",
            });
        }
    }, [wallet, fromToken, toToken, selectedChain.id, toast]);

    const debouncedQuote = useMemo(
        () => debounce((value: string) => handleQuote(value), 500),
        [handleQuote]
    );

    useEffect(() => {
        return () => {
            debouncedQuote.cancel();
        };
    }, [debouncedQuote]);

    useEffect(() => {
        setAssembledTransaction(null);
    }, [fromToken, toToken, selectedChain]);

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

    useEffect(() => {
        if (amount && fromToken && toToken) {
            debouncedQuote(amount);
        } else {
            setAssembledTransaction(null);
        }
    }, [amount, fromToken, toToken, debouncedQuote]);

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
        const provider = await wallet?.getEthereumProvider();

        const result = await provider?.request({
            method: "eth_sendTransaction",
            params: [
                {
                    ...assembledTransaction?.transaction,
                },
            ],
        });

        console.log("Swap tx", result);

        toast({
            title: "Swap Successful",
            description: `${result?.transactionHash}`,
        });

        if (onTransactionSuccess) {
            setTimeout(onTransactionSuccess, 2000);
        }
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
                    <Input placeholder="0.0" disabled value={assembledTransaction?.outValues[0]} />
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
                    (
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
