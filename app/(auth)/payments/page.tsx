import Link from "next/link";
import { ContactSearchBar } from "@/components/contacts/contact-search-bar";
import { ContactList } from "@/components/contacts/contact-list";

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
                <ContactList />
            </div>
        </div>
    );
}
