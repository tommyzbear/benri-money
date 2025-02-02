import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { MoreVertical, CreditCard } from "lucide-react";

export function BankAccounts() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold">Bank accounts and cards</h2>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                    <CreditCard className="h-8 w-8 text-gray-500" />
                    <div>
                        <p className="font-medium">The Platinum Card®</p>
                        <p className="text-sm text-muted-foreground">Credit ****03</p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-start text-blue-600 hover:text-blue-700"
                >
                    Link card or bank account
                </Button>
            </CardContent>
        </Card>
    );
} 