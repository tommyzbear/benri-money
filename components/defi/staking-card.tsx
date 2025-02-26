"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWalletStore } from "@/stores/use-wallet-store";
import { useToast } from "@/hooks/use-toast";
import { ConnectedWallet } from "@privy-io/react-auth";

import { Chain, createPublicClient, http } from "viem";
import { StakeKitClient, YieldOpportunity } from "@/app/services/stakekit";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface StakingCardProps {
    wallet?: ConnectedWallet;
    chains: Array<Chain>;
    onTransactionSuccess?: () => void;
}

type StakingStep = {
    id: number;
    name: string;
    description: string;
    status: 'pending' | 'loading' | 'complete' | 'error';
    txHash?: string;
    errorMessage?: string;
};

export function StakingCard({ wallet, chains, onTransactionSuccess }: StakingCardProps) {
    // Add immediate console log to verify component rendering
    console.log("StakingCard rendering with props:", { 
        hasWallet: !!wallet, 
        walletAddress: wallet?.address,
        chainsCount: chains?.length,
        chainNames: chains?.map(c => c.name)
    });

    const [selectedChain, setSelectedChain] = useState(chains[0]?.name);
    const [amount, setAmount] = useState("");
    const [selectedToken, setSelectedToken] = useState("");
    const [yieldOpportunities, setYieldOpportunities] = useState<YieldOpportunity[]>([]);
    const [selectedYield, setSelectedYield] = useState<YieldOpportunity | null>(null);
    const [isLoadingYields, setIsLoadingYields] = useState(false);
    const { balances } = useWalletStore();
    const { toast } = useToast();
    
    // Progress dialog state
    const [progressDialogOpen, setProgressDialogOpen] = useState(false);
    const [stakingSteps, setStakingSteps] = useState<StakingStep[]>([
        { id: 1, name: "Preparation", description: "Preparing transaction", status: 'pending' },
        { id: 2, name: "Transaction", description: "Processing transactions", status: 'pending' },
        { id: 3, name: "Completion", description: "Finalizing", status: 'pending' }
    ]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [progressPercentage, setProgressPercentage] = useState(0);

    // Log balances to check if they're available
    console.log("Available balances:", balances);

    // Memoize the StakeKit client to prevent recreation on every render
    const stakeKitClient = React.useMemo(() => {
        console.log("Creating StakeKit client with API key:", "33bea379-2557-4368-9d3d-09e0b47d6a68");
        return new StakeKitClient({
            apiKey: "33bea379-2557-4368-9d3d-09e0b47d6a68",
        });
    }, []);

    // Memoize the fetchYieldOpportunities function to use in the dependency array
    const fetchYieldOpportunities = React.useCallback(async () => {
        if (!selectedToken || !selectedChain) return;
        
        console.log("Fetching yield opportunities for:", { chain: selectedChain, token: selectedToken });
        setIsLoadingYields(true);
        
        try {
            const selectedTokenData = balances[selectedChain]?.find(
                (token) => token.contractAddress === selectedToken || 
                (token.contractAddress === "" && selectedToken === "0x0000000000000000000000000000000000000000")
            );
            
            if (!selectedTokenData) {
                console.error("Selected token not found in balances:", { selectedToken, balances });
                throw new Error("Selected token not found in balances");
            }
            
            const tokenInfo = {
                address: selectedToken,
                symbol: selectedTokenData.symbol,
                network: selectedChain.toLowerCase()
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
            console.log("Token selected, triggering fetch:", selectedToken);
            fetchYieldOpportunities();
        }
    }, [selectedChain, selectedToken, fetchYieldOpportunities]);

    // Update progress percentage when steps change
    useEffect(() => {
        const completedSteps = stakingSteps.filter(step => step.status === 'complete').length;
        const newPercentage = (completedSteps / stakingSteps.length) * 100;
        setProgressPercentage(newPercentage);
    }, [stakingSteps]);

    const updateStepStatus = (stepId: number, status: StakingStep['status'], txHash?: string, errorMessage?: string) => {
        setStakingSteps(prev => prev.map(step => 
            step.id === stepId 
                ? { ...step, status, txHash, errorMessage } 
                : step
        ));
        
        if (status === 'complete' && stepId < stakingSteps.length) {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    // Add state to track if a transaction is in progress
    const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
    
    // Add a ref to store abort controller
    const abortControllerRef = React.useRef<AbortController | null>(null);
    
    // Handle dialog close with confirmation if transaction is in progress
    const handleProgressDialogClose = (open: boolean) => {
        if (open === false && isTransactionInProgress) {
            // If user is trying to close while transaction is in progress, show confirmation
            if (confirm("Are you sure you want to close? This will not stop any pending transactions in your wallet.")) {
                // Abort any pending operations
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                setIsTransactionInProgress(false);
                setProgressDialogOpen(false);
            }
        } else {
            setProgressDialogOpen(open);
        }
    };

    const handleStake = async () => {
        if (!wallet || !amount || !selectedToken || !selectedYield) {
            toast({
                title: "Invalid Input",
                description: "Please fill in all fields and select a staking option",
                variant: "destructive",
            });
            return;
        }

        // Create new abort controller for this transaction
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        // Reset steps and open progress dialog
        setStakingSteps([
            { id: 1, name: "Preparation", description: "Preparing transaction", status: 'pending' },
            { id: 2, name: "Transaction", description: "Processing transactions", status: 'pending' },
            { id: 3, name: "Completion", description: "Finalizing", status: 'pending' }
        ]);
        setCurrentStepIndex(0);
        setProgressPercentage(0);
        setProgressDialogOpen(true);
        setIsTransactionInProgress(true);

        try {
            // Step 1: Preparation - Create transaction session
            updateStepStatus(1, 'loading');
            
            const session = await stakeKitClient.createTransactionSession(
                'enter',
                selectedYield.id,
                wallet.address,
                amount
            );
            
            console.log("Transaction session created:", session);
            updateStepStatus(1, 'complete');
            
            // Check if operation was aborted
            if (signal.aborted) throw new Error("Operation cancelled by user");
            
            // Step 2: Process all transactions sequentially
            updateStepStatus(2, 'loading');
            
            const provider = await wallet?.getEthereumProvider();
            if (!provider) throw new Error("Wallet provider not available");
            
            const txHashes = [];
            
            // Filter out skipped transactions
            const activeTransactions = session.transactions.filter(tx => tx.status !== "SKIPPED");
            
            // Update the step description to show progress
            updateStepStatus(2, 'loading', undefined, `Processing transaction 1/${activeTransactions.length}`);
            
            for (let i = 0; i < activeTransactions.length; i++) {
                const tx = activeTransactions[i];
                
                // Check if operation was aborted
                if (signal.aborted) throw new Error("Operation cancelled by user");
                
                // Get unsigned transaction
                let unsignedTx;
                for (let retry = 0; retry < 3; retry++) {
                    try {
                        unsignedTx = await stakeKitClient.request('PATCH', `/v1/transactions/${tx.id}`, {});
                        break;
                    } catch (err) {
                        console.log(`Attempt ${retry + 1} => retrying...`);
                        if (retry === 2) throw err; // Throw on last retry
                        
                        await new Promise((r, reject) => {
                            const timeoutId = setTimeout(r, 1000);
                            signal.addEventListener('abort', () => {
                                clearTimeout(timeoutId);
                                reject(new Error("Operation cancelled by user"));
                            }, { once: true });
                        });
                        
                        if (signal.aborted) throw new Error("Operation cancelled by user");
                    }
                }
                
                if (!unsignedTx || !unsignedTx.unsignedTransaction) {
                    console.error("Failed to get unsigned transaction data", tx);
                    throw new Error(`Failed to prepare transaction ${i+1}`);
                }
                
                // Update UI to show which transaction we're processing
                updateStepStatus(2, 'loading', undefined, `Processing transaction ${i+1}/${activeTransactions.length}. Please confirm in your wallet.`);
                
                // Parse and prepare transaction
                const jsonTx = JSON.parse(unsignedTx.unsignedTransaction);
                
                // Prepare transaction - remove nonce and set appropriate gas
                try {
                    // Remove the nonce field to let the wallet determine it
                    delete jsonTx.nonce;
                    
                    // Set or adjust gas limit
                    if (jsonTx.gas) {
                        // Add a 20% buffer to existing gas limit to ensure transaction success
                        const currentGas = parseInt(jsonTx.gas, 16);
                        const bufferedGas = Math.floor(currentGas * 1.2);
                        jsonTx.gas = '0x' + bufferedGas.toString(16);
                        console.log(`Adjusted gas limit with buffer: ${currentGas} → ${bufferedGas}`);
                    } else {
                        // If no gas limit is provided, estimate one
                        try {
                            const gasEstimate = await provider.request({
                                method: 'eth_estimateGas',
                                params: [{ ...jsonTx }]
                            });
                            
                            if (gasEstimate) {
                                // Add a 30% buffer to the estimate
                                const estimatedGas = parseInt(gasEstimate, 16);
                                const bufferedGas = Math.floor(estimatedGas * 1.3);
                                jsonTx.gas = '0x' + bufferedGas.toString(16);
                                console.log(`Estimated gas limit with buffer: ${estimatedGas} → ${bufferedGas}`);
                            }
                        } catch (estimateError) {
                            console.warn("Failed to estimate gas, using default:", estimateError);
                            // Set a reasonable default if estimation fails
                            jsonTx.gas = '0x186A0'; // 100,000 gas units
                        }
                    }
                } catch (prepError) {
                    console.warn("Error preparing transaction, continuing with original:", prepError);
                }
                
                // Send transaction
                try {
                    const txHash = await provider.request({
                        method: 'eth_sendTransaction',
                        params: [jsonTx]
                    });
                    
                    if (!txHash) {
                        throw new Error("Transaction failed - no hash returned");
                    }
                    
                    txHashes.push({
                        txId: tx.id,
                        hash: txHash
                    });
                    
                    // Submit transaction hash to StakeKit
                    try {
                        await stakeKitClient.submitTransactionHash(tx.id, txHash);
                    } catch (submitError) {
                        console.warn("Error submitting transaction hash:", submitError);
                        // Continue anyway - the transaction is on-chain regardless
                    }
                } catch (txError) {
                    console.error("Transaction error:", txError);
                    throw new Error(`Transaction ${i+1} failed: ${txError.message || "Unknown error"}`);
                }
                
                // Wait for a moment before proceeding to next transaction
                await new Promise((r, reject) => {
                    const timeoutId = setTimeout(r, 1000);
                    signal.addEventListener('abort', () => {
                        clearTimeout(timeoutId);
                        reject(new Error("Operation cancelled by user"));
                    }, { once: true });
                });
                
                if (signal.aborted) throw new Error("Operation cancelled by user");
            }
            
            // Mark transaction step as complete if we got here
            updateStepStatus(2, 'complete', txHashes.length > 0 ? txHashes[txHashes.length - 1].hash : undefined);
            
            // Step 3: Completion - check statuses and finalize
            updateStepStatus(3, 'loading');
            
            // Wait a few seconds to allow transactions to be processed
            await new Promise((r, reject) => {
                const timeoutId = setTimeout(r, 3000);
                signal.addEventListener('abort', () => {
                    clearTimeout(timeoutId);
                    reject(new Error("Operation cancelled by user"));
                }, { once: true });
            });
            
            if (signal.aborted) throw new Error("Operation cancelled by user");
            
            // Check status of all transactions if needed
            for (const txInfo of txHashes) {
                try {
                    const status = await stakeKitClient.checkTransactionStatus(txInfo.txId);
                    console.log(`Transaction ${txInfo.txId} status:`, status);
                } catch (statusError) {
                    console.warn(`Error checking transaction status for ${txInfo.txId}:`, statusError);
                    // Non-fatal, continue
                }
            }
            
            updateStepStatus(3, 'complete');
            
            toast({
                title: "Success",
                description: "Staking transaction completed successfully",
            });
            
            // Add this to refresh data after successful staking
            if (onTransactionSuccess) {
                // Add small delay to allow blockchain state to update
                setTimeout(onTransactionSuccess, 2000);
            }
            
            // Transaction is complete
            setIsTransactionInProgress(false);
        } catch (error) {
            if (error instanceof Error && error.message === "Operation cancelled by user") {
                console.log("Staking process cancelled by user");
                toast({
                    title: "Cancelled",
                    description: "Staking process was cancelled",
                });
            } else {
                console.error("Staking error:", error);
                
                // Find which step failed
                const failedStepId = stakingSteps.find(step => step.status === 'loading')?.id || currentStepIndex + 1;
                updateStepStatus(failedStepId, 'error', undefined, error instanceof Error ? error.message : 'Unknown error');
                
                toast({
                    title: "Staking Failed",
                    description: error instanceof Error ? error.message : "There was an error processing your staking request",
                    variant: "destructive",
                });
            }
        } finally {
            // Always clean up the abort controller
            abortControllerRef.current = null;
            setIsTransactionInProgress(false);
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
        <>
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
                                    <SelectItem key={token.contractAddress} value={token.contractAddress === "" ? "0x0000000000000000000000000000000000000000" : token.contractAddress}>
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
                                const selected = yieldOpportunities.find(y => y.id === value);
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
                                                <span>{yieldOpp.metadata.provider.name} - {yieldOpp.metadata.name}</span>
                                                <Badge variant="outline" className="ml-2 bg-primary/20">
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
                                    <span className="font-medium">{selectedYield.metadata.provider.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Protocol:</span>
                                    <span className="font-medium">{selectedYield.metadata.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Type:</span>
                                    <span className="font-medium">{selectedYield.metadata.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Annual Yield:</span>
                                    <span className="font-medium">{(selectedYield.apy * 100).toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <Button
                        className="w-full"
                        onClick={handleStake}
                        disabled={!wallet || !amount || !selectedToken || !selectedYield || isLoadingYields}
                    >
                        {isLoadingYields ? (
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

            {/* Progress Dialog with updated onOpenChange handler and prevent closing by clicking outside */}
            <Dialog 
                open={progressDialogOpen} 
                onOpenChange={handleProgressDialogClose}
                // This makes the dialog modal, preventing interaction with elements behind it
                modal={true}
            >
                <DialogContent 
                    className="sm:max-w-md"
                    // This prevents the dialog from closing when clicking outside
                    onPointerDownOutside={(e) => {
                        if (isTransactionInProgress) {
                            e.preventDefault();
                        }
                    }}
                    // This prevents the dialog from closing when pressing Escape
                    onEscapeKeyDown={(e) => {
                        if (isTransactionInProgress) {
                            e.preventDefault();
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>Staking Progress</DialogTitle>
                    </DialogHeader>
                    
                    <div className="py-4">
                        <Progress value={progressPercentage} className="mb-4" />
                        
                        <div className="space-y-4">
                            {stakingSteps.map((step, index) => (
                                <div 
                                    key={step.id} 
                                    className={`flex items-start p-3 rounded-lg border ${
                                        currentStepIndex === index ? 'border-primary bg-primary/5' : 'border-border'
                                    }`}
                                >
                                    <div className="mr-3 mt-0.5">
                                        {step.status === 'pending' && (
                                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                                        )}
                                        {step.status === 'loading' && (
                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        )}
                                        {step.status === 'complete' && (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        )}
                                        {step.status === 'error' && (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{step.name}</p>
                                        <p className="text-xs text-muted-foreground">{step.description}</p>
                                        
                                        {step.txHash && (
                                            <a 
                                                href={`https://etherscan.io/tx/${step.txHash}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline mt-1 inline-block"
                                            >
                                                View transaction
                                            </a>
                                        )}
                                        
                                        {step.errorMessage && (
                                            <p className="text-xs text-red-500 mt-1">{step.errorMessage}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                            <Button 
                                variant="outline" 
                                onClick={() => handleProgressDialogClose(false)}
                                disabled={isTransactionInProgress && !stakingSteps.some(step => step.status === 'error')}
                            >
                                {stakingSteps[stakingSteps.length - 1].status === 'complete' ? 'Done' : 'Close'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
} 