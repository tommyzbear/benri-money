import React from "react";
import Link from "next/link";

export default function DepositPage() {
    return (
        <div className="flex flex-col">
            <div className="flex flex-1 lg:flex-row lg:mx-auto lg:max-w-7xl lg:pb-8">
                <div className="flex flex-col flex-1 lg:max-w-3xl gap-2">
                    <div className="flex gap-2 h-56">
                        <Link
                            href="/deposit"
                            className="flex flex-1 h-full border flex-col justify-center items-start text-left bg-primary rounded-4xl p-5 text-primary-foreground"
                        >
                            <h2 className="mt-[35%] text-2xl font-libre italic mb-2">deposit</h2>
                            <p className="text-muted-foreground text-roboto text-sm">
                                cash or cryptocurrencies
                            </p>
                        </Link>

                        <Link
                            href="/withdraw"
                            className="flex flex-1 h-full border flex-col justify-center items-start text-left bg-primary rounded-4xl p-5 text-primary-foreground"
                        >
                            <h2 className="mt-[35%] text-2xl font-libre italic mb-2">withdraw</h2>
                            <p className="text-muted-foreground text-roboto text-sm">
                                to your bank or crypto wallet
                            </p>
                        </Link>
                    </div>
                    <div className="flex gap-2 h-36">
                        <Link
                            href="/convert"
                            className="flex w-32 h-full border flex-col justify-center items-start text-left bg-secondary rounded-7xl p-5 text-secondary-foreground"
                        ></Link>
                        <Link
                            href="/convert"
                            className="flex flex-1 h-full border flex-col justify-center items-start text-left bg-secondary rounded-4xl p-5 text-secondary-foreground"
                        >
                            <h2 className="mt-[20%] text-2xl font-libre italic mb-2">convert</h2>
                            <p className="text-muted-foreground text-roboto text-sm">
                                between cash or cryptocurrencies
                            </p>
                        </Link>
                    </div>

                    {/* Bottom links */}
                    <div className="space-y-2 mt-6 bg-white text-secondary-foreground rounded-4xl">
                        <Link
                            href="/payment-details"
                            className="flex items-center justify-between mx-5 py-5 border-b border-secondary"
                        >
                            <span className="text-lg text-zinc-600">payment details</span>
                            <span className="text-xl">›</span>
                        </Link>

                        <Link href="/history" className="flex items-center justify-between p-5">
                            <span className="text-lg text-zinc-600">history</span>
                            <span className="text-xl">›</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
