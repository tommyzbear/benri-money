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
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

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
      <div className="flex flex-1 lg:flex-row lg:mx-auto lg:max-w-7xl pb-24 lg:pb-8">

        {/* Main Content */}
        <div className="flex-1 p-4 lg:max-w-3xl">
          <React.Suspense fallback={<BalanceSkeleton />}>
            <Balance />
          </React.Suspense>
          <React.Suspense fallback={<RecentActivitySkeleton />}>
            <RecentActivity />
          </React.Suspense>
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
