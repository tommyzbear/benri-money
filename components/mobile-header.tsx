import { Bell, Menu } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";

export function MobileHeader() {
    return (
        <header className="flex items-center justify-between p-4 bg-[#1546a3] text-white">
            <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
            </Button>
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    4
                </span>
            </Button>
        </header>
    );
} 