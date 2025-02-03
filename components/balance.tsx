import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { MoreVertical, Wallet, Banknote } from "lucide-react";

export function Balance() {
    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold">Balances</h2>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Fiat Balance */}
                    <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Banknote className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">Bank Account</p>
                            <p className="text-2xl font-bold">£1,234.56</p>
                            <p className="text-sm text-muted-foreground">Available</p>
                        </div>
                        <Button variant="outline" size="sm">
                            Top Up
                        </Button>
                    </div>

                    {/* Web3 Balance */}
                    <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-full">
                            <Wallet className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">Web3 Wallet</p>
                            <p className="text-2xl font-bold">0.5 ETH</p>
                            <p className="text-sm text-muted-foreground">≈ £750.00</p>
                        </div>
                        <Button variant="outline" size="sm">
                            Transfer
                        </Button>
                    </div>

                    <Button className="w-full bg-[#1546a3]">Send Money</Button>
                </div>
            </CardContent>
        </Card>
    );
} 