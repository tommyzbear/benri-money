import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { label: "Account", href: "/myaccount" },
    { label: "Security", href: "/myaccount/security" },
    { label: "Data & Privacy", href: "/myaccount/privacy" },
    { label: "Payments", href: "/myaccount/payments" },
    { label: "Notifications", href: "/myaccount/notifications" },
    { label: "Seller Tools", href: "/myaccount/seller" },
    { label: "Tax Documents", href: "/myaccount/tax" },
];

export function AccountNav() {
    const pathname = usePathname();

    return (
        <nav className="p-4 space-y-2">
            {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="block">
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start",
                            pathname === item.href && "bg-accent"
                        )}
                    >
                        {item.label}
                    </Button>
                </Link>
            ))}
        </nav>
    );
} 