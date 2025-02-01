import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import Image from "next/image";
import { MoreVertical } from "lucide-react";

type ActivityItem = {
    icon: string;
    name: string;
    date: string;
    amount: string;
    type: "payment" | "automatic";
};

const recentActivities: ActivityItem[] = [
    {
        icon: "/uber-icon.png",
        name: "UBER PAYMENTS UK LIMITED",
        date: "12 Jan",
        amount: "-£26.27",
        type: "automatic",
    },
    {
        icon: "/apple-icon.png",
        name: "Apple Services",
        date: "11 Jan",
        amount: "-£0.99",
        type: "automatic",
    },
    {
        icon: "/mjg-icon.png",
        name: "MJG International, LLC",
        date: "7 Jan",
        amount: "-$39.00 USD",
        type: "automatic",
    },
];

export function RecentActivity() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold">Recent activity</h2>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between py-2 hover:bg-slate-50 cursor-pointer rounded-lg px-2"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Image
                                        src={activity.icon}
                                        alt={activity.name}
                                        width={24}
                                        height={24}
                                    />
                                </div>
                                <div>
                                    <p className="font-medium">{activity.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {activity.date} · {activity.type} payment
                                    </p>
                                </div>
                            </div>
                            <p className="font-medium">{activity.amount}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
} 