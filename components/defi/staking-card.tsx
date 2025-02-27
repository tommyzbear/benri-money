"use client";

import { useState, useEffect } from "react";
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
import { useWalletStore } from "@/stores/use-wallet-store";
import { useToast } from "@/hooks/use-toast";
import { ConnectedWallet } from "@privy-io/react-auth";

import { Chain, createPublicClient, encodeFunctionData, http } from "viem";
import { StakeKitClient, YieldOpportunity } from "@/app/services/stakekit";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight } from "lucide-react";

interface StakingCardProps {
    wallet?: ConnectedWallet;
    smartWalletClient?: any; // Using any for now, but you can define a proper type
    chains: Array<Chain>;
    onTransactionSuccess?: () => void;
}


export function StakingCard({ wallet, smartWalletClient, chains, onTransactionSuccess }: StakingCardProps) {
    // Add immediate console log to verify component rendering

    const [selectedChain, setSelectedChain] = useState(chains[0]?.name);
    const [amount, setAmount] = useState("");
    const [selectedToken, setSelectedToken] = useState("");
    const [yieldOpportunities, setYieldOpportunities] = useState<YieldOpportunity[]>([]);
    const [selectedYield, setSelectedYield] = useState<YieldOpportunity | null>(null);
    const [isLoadingYields, setIsLoadingYields] = useState(false);
    const [isStaking, setIsStaking] = useState(false);
    const { balances } = useWalletStore();
    const { toast } = useToast();

    // Log balances to check if they're available
    console.log("Available balances:", balances);

    // Memoize the StakeKit client to prevent recreation on every render
    const stakeKitClient = React.useMemo(() => {
        return new StakeKitClient({
            apiKey: "33bea379-2557-4368-9d3d-09e0b47d6a68",
        });
    }, []);

    // Memoize the fetchYieldOpportunities function to use in the dependency array
    const fetchYieldOpportunities = React.useCallback(async () => {
        if (!selectedToken || !selectedChain) return;

        console.log("Fetching yield opportunities for:", {
            chain: selectedChain,
            token: selectedToken,
        });
        setIsLoadingYields(true);

        try {
            const selectedTokenData = balances[selectedChain]?.find(
                (token) =>
                    token.contractAddress === selectedToken ||
                    (token.contractAddress === "" &&
                        selectedToken === "0x0000000000000000000000000000000000000000")
            );

            if (!selectedTokenData) {
                console.error("Selected token not found in balances:", { selectedToken, balances });
                throw new Error("Selected token not found in balances");
            }

            const tokenInfo = {
                address: selectedToken,
                symbol: selectedTokenData.symbol,
                network: selectedChain.toLowerCase(),
            };

            console.log("Requesting yields with token info:", tokenInfo);

            const yields = await stakeKitClient.getHighestYieldForTokens(
                selectedChain.toLowerCase(),
                [tokenInfo]
            );

            console.log("Received yield opportunities:", yields);
            setYieldOpportunities(yields);

            // Automatically select the highest yield option if available
            if (yields.length > 0) {
                setSelectedYield(yields[0]);
            }
        } catch (error) {
            console.error("Error fetching yield opportunities:", error);
            toast({
                title: "Error",
                description: "Failed to fetch staking options",
                variant: "destructive",
            });
        } finally {
            setIsLoadingYields(false);
        }
    }, [selectedChain, selectedToken, balances, stakeKitClient, toast]);

    useEffect(() => {
        // Reset selected yield when chain or token changes
        setSelectedYield(null);
        setYieldOpportunities([]);

        if (selectedToken) {
            fetchYieldOpportunities();
        }
    }, [selectedChain, selectedToken, fetchYieldOpportunities]);

    const handleStake = async () => {
        if (!selectedYield) {
            toast({
                title: "No yield option selected",
                description: "Please select a yield option",
                variant: "destructive",
            });
            return;
        }

        // Use smart wallet if available, otherwise fall back to regular wallet
        const useSmartWallet = !!smartWalletClient;
        
        if (!useSmartWallet && !wallet) {
            toast({
                title: "No wallet connected",
                description: "Please connect a wallet to continue",
                variant: "destructive",
            });
            return;
        }

        // Set staking state to true
        setIsStaking(true);
        
        // Show initial toast
        const loadingToast = toast({
            title: "Preparing transaction",
            description: "Creating staking session...",
        });

        try {
            // Step 1: Create transaction session without triggering wallet interactions
            const session = await stakeKitClient.createTransactionSession(
                "enter",
                selectedYield.id,
                useSmartWallet ? smartWalletClient.account.address : wallet.address,
                amount
            );

            console.log("Transaction session created:", session);

            // Filter out skipped transactions
            const activeTransactions = session.transactions.filter((tx) => tx.status !== "SKIPPED");

            if (activeTransactions.length === 0) {
                throw new Error("No valid transactions to process");
            }

            let finalTxHash;

            if (useSmartWallet) {
                // SMART WALLET BATCH TRANSACTION APPROACH
                
                // First, collect ALL transaction data without any wallet interactions
                const transactionCalls = [];
                const transactionIds = [];
                
                // Update toast to show preparation status
                toast({
                    id: loadingToast.id,
                    title: "Preparing transaction",
                    description: "Building batch transaction...",
                });
                
                // Prepare all transactions for batch processing without wallet interaction
                for (let i = 0; i < activeTransactions.length; i++) {
                    const tx = activeTransactions[i];
                    transactionIds.push(tx.id);
                    
                    // Get unsigned transaction
                    let unsignedTx;
                    for (let retry = 0; retry < 3; retry++) {
                        try {
                            unsignedTx = await stakeKitClient.request(
                                "PATCH",
                                `/v1/transactions/${tx.id}`,
                                {}
                            );
                            break;
                        } catch (err) {
                            console.log(`Attempt ${retry + 1} => retrying...`);
                            
                            if (retry === 2) throw err; // Throw on last retry
                            await new Promise(r => setTimeout(r, 1000));
                        }
                    }
                    
                    if (!unsignedTx || !unsignedTx.unsignedTransaction) {
                        console.error("Failed to get unsigned transaction data", tx);
                        throw new Error(`Failed to prepare transaction ${i + 1}`);
                    }
                    
                    // Parse JSON transaction
                    const jsonTx = JSON.parse(unsignedTx.unsignedTransaction);
                    
                    // Add to batch calls
                    transactionCalls.push({
                        to: jsonTx.to,
                        data: jsonTx.data,
                        value: jsonTx.value || "0x0"
                    });
                }
                
                // Now that all transactions are prepared, show the wallet confirmation toast
                toast({
                    id: loadingToast.id,
                    title: "Processing transaction",
                    description: "Please confirm the batch transaction in your wallet.",
                });
                
                // Only NOW trigger the wallet interaction - just once for the entire batch
                const result = await smartWalletClient.sendTransaction({
                    account: smartWalletClient.account,
                    calls: transactionCalls
                });
                
                finalTxHash = result.hash;
                console.log("Batch transaction sent:", finalTxHash);
                
                // After successful transaction, update the StakeKit backend (without wallet interaction)
                toast({
                    id: loadingToast.id,
                    title: "Finalizing",
                    description: "Transaction confirmed, updating records...",
                });
                
                // Submit transaction hash to StakeKit for all transactions
                const submitPromises = transactionIds.map(id => 
                    stakeKitClient.submitTransactionHash(id, finalTxHash)
                        .catch(err => console.warn(`Error submitting hash for tx ${id}:`, err))
                );
                
                // Wait for all submissions to complete
                await Promise.allSettled(submitPromises);
                
            } 

            // Wait a few seconds to allow transactions to be processed
            await new Promise(r => setTimeout(r, 2000));

            // Success toast with transaction link
            toast({
                id: loadingToast.id,
                title: "Staking successful",
                description: finalTxHash ? (
                    <div className="flex flex-col space-y-2">
                        <span>Your assets have been staked successfully.</span>
                        <a 
                            href={`https://etherscan.io/tx/${finalTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm flex items-center"
                        >
                            View transaction <ArrowUpRight className="h-3 w-3 ml-1" />
                        </a>
                    </div>
                ) : "Your assets have been staked successfully.",
                variant: "default",
            });

            // Add this to refresh data after successful staking
            if (onTransactionSuccess) {
                // Add small delay to allow blockchain state to update
                setTimeout(onTransactionSuccess, 2000);
            }
        } catch (error) {
            // Handle errors
            console.error("Staking error:", error);
            
            toast({
                id: loadingToast.id,
                title: "Error",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                variant: "destructive",
            });
        } finally {
            // Reset staking state
            setIsStaking(false);
        }
    };

    // Add explicit handlers with logging for state changes
    const handleChainChange = (chain: string) => {
        console.log("Chain selected:", chain);
        setSelectedChain(chain);
    };

    const handleTokenChange = (token: string) => {
        console.log("Token selected:", token);
        setSelectedToken(token);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Amount changed:", e.target.value);
        setAmount(e.target.value);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stake Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select value={selectedChain} onValueChange={handleChainChange}>
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
                        onChange={handleAmountChange}
                        type="number"
                    />
                    <Select value={selectedToken} onValueChange={handleTokenChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Token" />
                        </SelectTrigger>
                        <SelectContent>
                            {balances[selectedChain]?.map((token) => (
                                <SelectItem
                                    key={token.contractAddress}
                                    value={
                                        token.contractAddress === ""
                                            ? "0x0000000000000000000000000000000000000000"
                                            : token.contractAddress
                                    }
                                >
                                    {token.symbol}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium">Staking Option</p>
                    <Select
                        value={selectedYield?.id || ""}
                        onValueChange={(value) => {
                            const selected = yieldOpportunities.find((y) => y.id === value);
                            if (selected) setSelectedYield(selected);
                        }}
                        disabled={isLoadingYields || yieldOpportunities.length === 0}
                    >
                        <SelectTrigger>
                            {isLoadingYields ? (
                                <div className="flex items-center">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span>Loading options...</span>
                                </div>
                            ) : (
                                <SelectValue placeholder="Select staking option" />
                            )}
                        </SelectTrigger>
                        <SelectContent>
                            {yieldOpportunities.length > 0 ? (
                                yieldOpportunities.map((yieldOpp) => (
                                    <SelectItem key={yieldOpp.id} value={yieldOpp.id}>
                                        <div className="flex justify-between items-center w-full">
                                            <span>
                                                {yieldOpp.metadata.provider.name} -{" "}
                                                {yieldOpp.metadata.name}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="ml-2 bg-primary/20"
                                            >
                                                {(yieldOpp.apy * 100).toFixed(2)}% APY
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="none" disabled>
                                    No options available
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {selectedYield && (
                    <div className="rounded-lg bg-secondary p-4 space-y-2">
                        <p className="text-sm font-medium">Selected Option Details</p>
                        <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                                <span>Provider:</span>
                                <span className="font-medium">
                                    {selectedYield.metadata.provider.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Protocol:</span>
                                <span className="font-medium">
                                    {selectedYield.metadata.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Type:</span>
                                <span className="font-medium">
                                    {selectedYield.metadata.type}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Annual Yield:</span>
                                <span className="font-medium">
                                    {(selectedYield.apy * 100).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <Button
                    className="w-full"
                    onClick={handleStake}
                    disabled={
                        !wallet ||
                        !amount ||
                        !selectedToken ||
                        !selectedYield ||
                        isLoadingYields ||
                        isStaking
                    }
                >
                    {isStaking ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Staking...
                        </>
                    ) : isLoadingYields ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                        </>
                    ) : (
                        "Stake"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
