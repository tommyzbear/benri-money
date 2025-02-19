import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/stores/use-user-store";

interface SetUsernameDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SetUsernameDialog({ open, onOpenChange }: SetUsernameDialogProps) {
    const [newUsername, setNewUsername] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const { updateUsername } = useUserStore();
    const { toast } = useToast();

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
            onOpenChange(false);
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
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                            onClick={() => onOpenChange(false)}
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
    );
}
