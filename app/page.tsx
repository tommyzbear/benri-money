import { MobileHeader } from "@/components/mobile-header";
import { DesktopHeader } from "@/components/desktop-header";
import { Balance } from "@/components/balance";
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/quick-actions";
import { SendAgain } from "@/components/send-again";
import { BankAccounts } from "@/components/bank-accounts";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrivyClient } from "@privy-io/server-auth";

async function checkAuth() {
  const cookieStore = cookies();
  const cookieAuthToken = cookieStore.get("privy-token");

  // If no cookie is found, skip any further checks
  if (!cookieAuthToken) return null;

  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
  const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

  try {
    const claims = await client.verifyAuthToken(cookieAuthToken.value);
    return claims;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function Home() {
  const auth = await checkAuth();

  if (!auth) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile Header - visible only on mobile */}
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      {/* Desktop Header - visible only on desktop */}
      <div className="hidden lg:block">
        <DesktopHeader />
      </div>

      <div className="flex flex-1 lg:flex-row lg:mx-auto lg:max-w-7xl">
        {/* Main Content */}
        <div className="flex-1 p-4 lg:max-w-3xl">
          <Balance />
          <RecentActivity />
        </div>

        {/* Right Sidebar - visible only on desktop */}
        <div className="hidden lg:block lg:max-w-xl lg:p-4 lg:border-l">
          <QuickActions />
          <SendAgain />
          <BankAccounts />
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
