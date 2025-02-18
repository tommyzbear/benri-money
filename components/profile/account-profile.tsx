"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { UploadProfileImageDialog } from "@/components/dialogs/upload-profile-image-dialog";
import Image from "next/image";
import { useUserStore } from "@/stores/use-user-store";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function AccountProfile() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const { ready } = usePrivy();
    const { user, error, fetchUser, updateUsername } = useUserStore();
    const { toast } = useToast();

    useEffect(() => {
        if (!ready) return;
        fetchUser();
    }, [ready, fetchUser]);

    useEffect(() => {
        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error,
            });
        }
    }, [error, toast]);

    const handleUsernameUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Username cannot be empty or empty spaces",
            });
            return;
        }

        setIsUpdating(true);
        try {
            await updateUsername(newUsername);
            toast({
                title: "Success",
                description: "Username updated successfully",
            });
            setUsernameDialogOpen(false);
            setNewUsername("");
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update username",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="relative">
                        <div className="h-32 bg-[#1546a3]" />
                        <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                                    {user?.profile_img ? (
                                        <Image
                                            src={user.profile_img}
                                            alt="Profile"
                                            fill
                                            className="object-cover rounded-full"
                                        />
                                    ) : (
                                        <User className="w-12 h-12 text-white" />
                                    )}
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute bottom-0 right-0 rounded-full bg-white shadow-lg"
                                    onClick={() => setDialogOpen(true)}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-16">
                        <div className="flex flex-col space-y-2">
                            <h2 className="text-2xl font-bold">{user?.username || "Anon"}</h2>
                            <Button
                                variant="ghost"
                                className="text-blue-600 w-fit px-0 hover:bg-transparent hover:text-blue-700"
                                onClick={() => setUsernameDialogOpen(true)}
                            >
                                Change Name
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={usernameDialogOpen} onOpenChange={setUsernameDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Change Username</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUsernameUpdate} className="space-y-4">
                        <Input
                            placeholder="Enter new username"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            disabled={isUpdating}
                        />
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setUsernameDialogOpen(false)}
                                disabled={isUpdating}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? "Updating..." : "Update"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <UploadProfileImageDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </>
    );
} 