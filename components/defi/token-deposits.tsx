"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectedWallet } from "@privy-io/react-auth";
import { Chain } from "viem";
import { StakeKitClient, BalanceResponse } from "@/services/stakekit";
import { Loader2, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatValue } from "@/lib/utils";

interface TokenDepositsProps {
  wallet?: ConnectedWallet;
  chains: Array<Chain>;
  refreshTrigger?: number;
  onTransactionSuccess?: () => void;
}

export function TokenDeposits({ wallet, chains, refreshTrigger = 0, onTransactionSuccess }: TokenDepositsProps) {
  const [deposits, setDeposits] = useState<BalanceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Memoize the StakeKit client to prevent recreation on every render
  const stakeKitClient = useMemo(() => {
    return new StakeKitClient({
      apiKey: "33bea379-2557-4368-9d3d-09e0b47d6a68",
    });
  }, []);

  // Fetch user's yield balances
  useEffect(() => {
    const fetchDeposits = async () => {
      if (!wallet?.address) return;

      setIsLoading(true);
      try {
        console.log("Fetching yield balances for address:", wallet.address);
        const balances = await stakeKitClient.getYieldBalance(wallet.address);
        console.log("Received yield balances:", balances);

        // Filter out deposits with zero or negative value
        const nonZeroBalances = balances.filter(deposit => {
          const amount = parseFloat(deposit.amount);
          return amount > 0.0001;
        });

        // Fetch APY for each deposit
        const balancesWithApy = await Promise.all(
          nonZeroBalances.map(async (deposit) => {
            try {
              const apy = await stakeKitClient.getIntegrationDetails(deposit.integrationId);
              return { ...deposit, apy: apy.apy };
            } catch (error) {
              console.error(`Failed to fetch APY for ${deposit.integrationId}:`, error);
              return deposit;
            }
          })
        );

        setDeposits(balancesWithApy);
      } catch (error) {
        console.error("Error fetching yield balances:", error);
        toast({
          title: "Error",
          description: "Failed to fetch your staked assets",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeposits();
  }, [wallet?.address, stakeKitClient, toast, refreshTrigger]);

  const handleUnstake = async (integrationId: string, amount: string) => {
    if (!wallet?.address) return;

    try {
      toast({
        title: "Unstaking",
        description: "Preparing unstaking transaction...",
      });

      const session = await stakeKitClient.createExitRequest(integrationId, wallet.address, amount);
      console.log("Session:", session);
      const provider = await wallet?.getEthereumProvider();
      const unsignedTxs = [];
      for (const tx of session.transactions) {
        console.log("Tx:", tx);
        let unsignedTx;
        for (let i = 0; i < 3; i++) {
          try {
            unsignedTx = await stakeKitClient.request('PATCH', `/v1/transactions/${tx.id}`, {});
            break;
          } catch (err) {
            console.log(`Attempt ${i + 1} => retrying...`);
            await new Promise(r => setTimeout(r, 500));
          }
        }
        if (unsignedTx) {
          unsignedTxs.push({
            ...tx,
            unsignedTransaction: unsignedTx.unsignedTransaction
          });
        }
      }

      const txHashes = [];
      for (const tx of unsignedTxs) {
        try {
          const jsonTx = JSON.parse(tx.unsignedTransaction);
          try {
            delete jsonTx.nonce;
            console.log("Sending unstaking transaction with wallet-determined nonce");
          } catch (nonceError) {
            console.warn("Error updating nonce, continuing with original:", nonceError);
          }

          const txHash = await provider?.request({
            method: 'eth_sendTransaction',
            params: [jsonTx]
          });

          if (txHash) {
            txHashes.push(txHash);
            try {
              await stakeKitClient.submitTransactionHash(tx.id, txHash);
            } catch (submitError) {
              console.warn("Error submitting transaction hash:", submitError);
            }
          }
        } catch (error) {
          console.error("Error sending transaction:", error);
          toast({
            title: "Error",
            description: `Failed to send transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Unstaking successful",
        description: `Your assets have been unstaked. Transaction${txHashes.length > 1 ? 's' : ''}: ${txHashes.join(', ')}`,
      });

      if (onTransactionSuccess) {
        setTimeout(onTransactionSuccess, 2000);
      }

    } catch (error) {
      console.error("Error unstaking:", error);
      toast({
        title: "Error",
        description: "Failed to unstake your assets",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Staked Assets</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (deposits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Staked Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">You don't have any staked assets yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Staked Assets</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deposits.map((deposit) => {
          // Calculate the USD value if possible
          const usdValue = deposit.pricePerShare
            ? parseFloat(deposit.amount) * parseFloat(deposit.pricePerShare)
            : 0;

          return (
            <Card key={deposit.integrationId} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 bg-secondary/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {deposit.token.logoURI && (
                        <img
                          src={deposit.token.logoURI}
                          alt={deposit.token.symbol}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{deposit.token.name}</h4>
                        <p className="text-sm text-muted-foreground">{deposit.token.symbol}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-primary/10">
                      {deposit.type}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium">
                        {parseFloat(deposit.amount).toFixed(6)} {deposit.token.symbol}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Value</p>
                      <p className="font-medium">
                        {usdValue > 0 ? formatValue(usdValue) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Network</p>
                      <p className="font-medium capitalize">{deposit.token.network}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">APY</p>
                      <p className="font-medium text-green-500">
                        {deposit.apy ? `${(parseFloat(deposit.apy) * 100).toFixed(2)}%` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {deposit.pendingActions && deposit.pendingActions.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="font-medium text-amber-500">
                        {deposit.pendingActions.join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleUnstake(deposit.integrationId, deposit.amount)}
                    >
                      Unstake
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 