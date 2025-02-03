import { Bell, Settings } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";

export function DesktopHeader() {
    return (
        <header className="flex items-center justify-between px-6 py-3 bg-[#1546a3] text-white">
            <div className="flex items-center space-x-8">
                <Image src="/logo.png" alt="Logo" width={32} height={32} />
                <nav className="flex space-x-6">
                    <Button variant="ghost"><Link href="/">Home</Link></Button>
                    <Button variant="ghost"><Link href="/contacts">Contacts</Link></Button>
                    <Button variant="ghost"><Link href="/cards">Cards</Link></Button>
                    <Button variant="ghost"><Link href="/crypto">Crypto</Link></Button>
                    <Button variant="ghost"><Link href="/myaccount">Me</Link></Button>
                </nav>
            </div>
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                        4
                    </span>
                </Button>
                <Button variant="ghost" size="icon">
                    <Settings className="h-6 w-6" />
                </Button>
                <Button variant="ghost">LOG OUT</Button>
            </div>
        </header>
    );
} 