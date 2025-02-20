import { RecentActivity } from "@/components/recent-activity";
import { SendAgain } from "@/components/send-again";
import { BankAccounts } from "@/components/bank-accounts";

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-1 lg:flex-row lg:mx-auto lg:max-w-7xl lg:pb-8">
                <div className="flex-1 lg:max-w-3xl">
                    <RecentActivity />
                </div>

                <div className="hidden lg:block lg:max-w-xl lg:p-4 lg:border-l">
                    <SendAgain />
                    <BankAccounts />
                </div>
            </div>
        </div>
    );
}
