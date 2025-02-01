import { Button } from "./ui/button";
import { HomeIcon, CreditCard, User, BitcoinIcon } from "lucide-react";

const actions = [
    {
        icon: <HomeIcon className="h-6 w-6" />,
        label: "Home",
    },
    {
        icon: <CreditCard className="h-6 w-6" />,
        label: "Cards",
    },
    {
        icon: <BitcoinIcon className="h-6 w-6" />,
        label: "Crypto",
    },
    {
        icon: <User className="h-6 w-6" />,
        label: "Me",
    },
];

export function QuickActions() {
    return (
        <div className="grid grid-cols-4 gap-4 mb-1">
            {actions.map((action, index) => (
                <Button
                    key={index}
                    variant="ghost"
                    className="flex flex-col items-center space-y-1 h-auto py-2"
                >
                    {action.icon}
                    <span className="text-xs text-center">{action.label}</span>
                </Button>
            ))}
        </div>
    );
} 