import { MobileHeader } from "@/components/mobile-header";
import { DesktopHeader } from "@/components/desktop-header";
import { Balance } from "@/components/balance";
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/quick-actions";
import { SendAgain } from "@/components/send-again";
import { BankAccounts } from "@/components/bank-accounts";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { privyClient } from "@/lib/privy";

async function checkAuth() {
  const cookieStore = cookies();
  const cookieAuthToken = cookieStore.get("privy-token");

  // If no cookie is found, skip any further checks
  if (!cookieAuthToken) return null;

  try {
    const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);
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
    </div>
  );
}
