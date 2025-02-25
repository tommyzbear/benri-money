import { RecentActivity } from "@/components/recent-activity";

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-1 lg:flex-row lg:mx-auto lg:max-w-7xl lg:pb-8">
                <div className="flex-1 lg:max-w-3xl">
                    <RecentActivity />
                </div>
            </div>
        </div>
    );
}
