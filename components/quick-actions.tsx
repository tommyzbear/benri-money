import Link from "next/link";
import { Button } from "./ui/button";
import { HomeIcon, CreditCard, User, BitcoinIcon, Users } from "lucide-react";

const actions = [
    {
        icon: <HomeIcon className="h-6 w-6" />,
        label: "Home",
    },
    {
        icon: <Users className="h-6 w-6" />,
        label: "Contacts",
        href: "/contacts",
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
        href: "/myaccount",
    },
];

export function QuickActions() {
    return (
        <div className="grid grid-cols-5 gap-4 mb-1">
            {actions.map((action, index) => (
                <Button
                    key={index}
                    variant="ghost"
                    className="h-auto py-2"
                >
                    <Link href={action.href || "/"} className="flex flex-col items-center space-y-1">
                        {action.icon}
                        <span className="text-xs text-center">{action.label}</span>
                    </Link>
                </Button>
            ))}
        </div>
    );
} 