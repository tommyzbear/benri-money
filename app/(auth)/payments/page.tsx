import { ContactSearchBar } from "@/components/contacts/contact-search-bar";
import { ContactList } from "@/components/contacts/contact-list";
import { Suspense } from "react";
import { Skeleton } from "@mui/material";
import Link from "next/link";

const ContactListSkeleton = () => {
    return (
        <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="p-4 bg-white rounded-lg border flex items-center justify-between"
                >
                    <div className="flex items-center space-x-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <Skeleton className="h-9 w-9 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default function PaymentsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex gap-2 h-24">
                <Link
                    href="/deposit"
                    className="flex flex-1 h-full border flex-col justify-center items-start text-left bg-primary rounded-4xl p-5 text-primary-foreground"
                >
                    <h2 className="mt-auto text-2xl font-libre italic mb-2">send</h2>
                </Link>

                <Link
                    href="/withdraw"
                    className="flex flex-1 h-full border flex-col justify-center items-start text-left bg-primary rounded-4xl p-5 text-primary-foreground"
                >
                    <h2 className="mt-auto text-2xl font-libre italic mb-2">request</h2>
                </Link>
            </div>
            <div className="flex flex-col gap-0 bg-white rounded-3xl p-0 overflow-hidden min-h-[calc(100vh-24rem)]">
                <div className="pl-5 pt-2 pb-1 m-0 bg-primary">
                    <h3 className="header-text text-primary-foreground">contacts</h3>
                </div>
                <ContactSearchBar />
                <Suspense fallback={<ContactListSkeleton />}>
                    <ContactList />
                </Suspense>
            </div>
        </div>
    );
}
