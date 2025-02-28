"use client";

import Link from "next/link";
import { House, PiggyBank, Cardholder, User, CurrencyEth } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function MobileNav() {
    const navContainerClasses = "absolute bottom-0 left-0 right-0 lg:hidden z-50";
    const navBarClasses = "w-auto h-[4.5rem] mx-4 mb-[21px] rounded-full bg-primary flex px-3 z-10";
    const navLinkClasses = "flex flex-col rounded-full justify-center items-center h-12";
    const pathname = usePathname()

    return (
        <div className={navContainerClasses}>
            <div className={navBarClasses}>
                <div className="flex w-full justify-start items-center gap-2.5">
                    <Link
                        href="/home"
                        className={cn(navLinkClasses, "bg-chart-4 text-chart-4-foreground/90", pathname === "/home" ? "w-24" : "w-12")}
                    >
                        <House size={28} weight="fill" />
                    </Link>
                    <Link
                        href="/deposit"
                        className={cn(navLinkClasses, "bg-chart-1 text-primary/80", pathname === "/deposit" ? "w-24" : "w-12")}
                    >
                        <PiggyBank size={28} weight="fill" />
                    </Link>
                    <Link
                        href="/payments"
                        className={cn(navLinkClasses, "bg-chart-4-foreground text-primary/80", pathname === "/payments" ? "w-24" : "w-12")}
                    >
                        <Cardholder size={28} weight="fill" />
                    </Link>
                    <Link href="/defi" className={cn(navLinkClasses, "bg-chart-3 text-primary/80", pathname === "/defi" ? "w-24" : "w-12")}>
                        <CurrencyEth size={28} weight="fill" />
                    </Link>
                    <Link
                        href="/profile"
                        className={cn(
                            navLinkClasses,
                            "bg-chart-1-foreground text-primary/70 ml-auto",
                            pathname === "/profile" ? "w-24" : "w-12"
                        )}
                    >
                        <User size={28} weight="fill" />
                    </Link>
                </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background from-[50%] to-transparent -z-10" />
        </div>
    );
}
