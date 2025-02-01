import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { MoreVertical } from "lucide-react";

export function Balance() {
    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold">PayPal balance</h2>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="text-4xl font-bold">£0.00</p>
                        <p className="text-sm text-muted-foreground">Available</p>
                    </div>
                    <Button className="w-full bg-[#1546a3]">Transfer Money</Button>
                </div>
            </CardContent>
        </Card>
    );
} 