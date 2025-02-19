import { Balance } from "@/components/balance";
import { RecentActivity } from "@/components/recent-activity";
import { SendAgain } from "@/components/send-again";
import { BankAccounts } from "@/components/bank-accounts";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function BalanceSkeleton() {
    return (
        <div className="space-y-4 p-6 bg-white rounded-lg border">
            <div className="flex justify-between items-center">
                <Skeleton className="h-7 w-24" />
            </div>
            <div className="space-y-3">
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </div>
            <Skeleton className="h-10 w-full mt-4" />
        </div>
    );
}

function RecentActivitySkeleton() {
    return (
        <div className="space-y-4 p-6 bg-white rounded-lg border">
            <Skeleton className="h-7 w-32" />
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-1 lg:flex-row lg:mx-auto lg:max-w-7xl pb-24 lg:pb-8">
                <div className="flex-1 lg:max-w-3xl">
                    <Suspense fallback={<BalanceSkeleton />}>
                        <Balance />
                    </Suspense>
                    <Suspense fallback={<RecentActivitySkeleton />}>
                        <RecentActivity />
                    </Suspense>
                </div>

                <div className="hidden lg:block lg:max-w-xl lg:p-4 lg:border-l">
                    <SendAgain />
                    <BankAccounts />
                </div>
            </div>
        </div>
    );
}
