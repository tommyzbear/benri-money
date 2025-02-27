"use client";

import { AccountDetails } from "@/components/profile/account-details";
import { Button } from "@/components/ui/button";
import { ProfileImgMask } from "@/components/profile/profile-img-mask";
import { Textfit } from "react-textfit";
import { cn, getGreetingsByHour } from "@/lib/utils";
import { useUserStore } from "@/stores/use-user-store";
import { UploadProfileImageDialog } from "@/components/dialogs/upload-profile-image-dialog";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

export default function ProfilePage() {
    const { user: userStore, fetchUser } = useUserStore();
    const { user, ready } = usePrivy();
    const [uploadProfileImageDialogOpen, setUploadProfileImageDialogOpen] = useState(false);

    useEffect(() => {
        if (!ready || userStore !== null) return;
        fetchUser();
    }, [ready, fetchUser]);

    return (
        <div className="container mx-auto max-w-4xl rounded-3xl overflow-hidden">
            <div className="h-full flex-row justify-start items-center relative pb-6 animate-fade-in hidden lg:flex">
                <div
                    className={cn(
                        "flex items-center gap-4 flex-1",
                        "bg-primary rounded-4xl",
                        "p-5 pt-4 shadow-md h-full"
                    )}
                >
                    <div className="relative w-fit h-full mb-auto">
                        <Button
                            className="w-20 h-20 bg-neutral-600 rounded-lg p-2"
                            onClick={() => setUploadProfileImageDialogOpen(true)}
                        >
                            <ProfileImgMask />
                        </Button>
                        {/* <Pencil className="w-4 h-4" /> */}
                    </div>
                    <div className="h-full w-full flex flex-col justify-start items-start">
                        <div className="h-fit w-full font-libre text-2xl text-white italic leading-[2.2rem] pt-1">
                            <h1>{getGreetingsByHour()},</h1>
                            <Textfit
                                mode="single"
                                forceSingleModeWidth={true}
                                min={16}
                                max={24}
                                className=""
                            >
                                {userStore?.username || "anon"}
                            </Textfit>
                        </div>
                    </div>
                </div>
            </div>
            <UploadProfileImageDialog
                open={uploadProfileImageDialogOpen}
                onOpenChange={setUploadProfileImageDialogOpen}
            />
            <AccountDetails />
        </div>
    );
}
