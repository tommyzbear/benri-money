import Link from "next/link";
import { HomeIcon, CreditCard, User, PiggyBank } from "lucide-react";

export function MobileNav() {
    const actions = [
        {
            icon: <HomeIcon className="h-[50%] w-[50%] fill-black" />,
            label: "Home",
            href: "/home",
        },
        {
            icon: <PiggyBank className="h-[60%] w-[60%] fill-black stroke-width-2" />,
            label: "Deposit",
            href: "/deposit",
        },
        {
            icon: <CreditCard className="h-[50%] w-[50%]" />,
            label: "Payments",
            href: "/payments",
        },
        {
            icon: <User className="h-[50%] w-[50%]" />,
            label: "Profile",
            href: "/profile",
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden">
            <div className="w-auto h-20 mx-4 mb-[21px] rounded-full bg-primary flex px-3 z-20">
                <div className="flex w-full justify-start items-center gap-2.5 ">
                    {actions.map((action, index) => (
                        <Link
                            key={index}
                            href={action.href}
                            className={`flex flex-col rounded-full justify-center items-center w-14 h-14 border bg-white ${
                                index === actions.length - 1 ? "ml-auto" : ""
                            }`}
                        >
                            {action.icon}
                        </Link>
                    ))}
                </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background from-[50%] to-transparent z-[-10]" />
        </div>
    );
}
