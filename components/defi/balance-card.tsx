"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { NetworkIcon } from "@/components/network-icon";
import { formatValue } from "@/lib/utils";
import { Chain } from "@wagmi/core/chains";
import { TokenData } from "@/services/alchemy";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
    chains: ReadonlyArray<Chain>;
    balances: Record<string, TokenData[]>;
    totalBalance?: number;
    className?: string;
}

export function BalanceCard({ chains, balances, totalBalance, className }: BalanceCardProps) {
    return (
        <Card className={cn("rounded-3xl", className)}>
            <CardContent className="">
                <Accordion type="single" collapsible className="w-full" defaultValue="holdings">
                    <AccordionItem value="holdings">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                                <span className="font-libre italic text-lg">Current Holdings</span>
                                <span className="hidden lg:block font-semibold">
                                    {formatValue(totalBalance || 0)}
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 pt-4">
                                {chains.map((chain) => (
                                    <div key={chain.id} className="space-y-2">
                                        <div className="flex items-center gap-2 px-2">
                                            <NetworkIcon chain={chain.name} className="h-5 w-5" />
                                            <span className="font-semibold text-sm">
                                                {chain.name}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            {balances[chain.name]?.map((token) => (
                                                <div
                                                    key={token.contractAddress}
                                                    className="flex justify-between items-center py-2 px-4 rounded-lg hover:bg-secondary/50"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">
                                                            {token.symbol}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-sm">
                                                            {formatValue(Number(token.value))}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {Number(token.balance).toFixed(4)}{" "}
                                                            {token.symbol}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}
