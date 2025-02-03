"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Home, ChevronDown, Plus, Wallet, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePrivy, User } from "@privy-io/react-auth";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export function AccountDetails() {
    const { toast } = useToast();
    const {
        ready,
        authenticated,
        user,
        logout,
        linkEmail,
        linkWallet,
        unlinkEmail,
        linkPhone,
        unlinkPhone,
        unlinkWallet,
        linkGoogle,
        unlinkGoogle,
        linkTwitter,
        unlinkTwitter,
        linkDiscord,
        unlinkDiscord,
    } = usePrivy();

    const numAccounts = user?.linkedAccounts?.length || 0;
    const canRemoveAccount = numAccounts > 1;

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast({
                description: "Copied to clipboard",
                duration: 2000,
            });
        } catch (error) {
            console.error('Failed to copy:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to copy to clipboard",
            });
        }
    };

    const handleUnlink = async (type: string, value: string, unlinkFn: (value: string) => Promise<User>) => {
        try {
            await unlinkFn(value);
        } catch (error) {
            console.error(`Error unlinking ${type}:`, error);
            toast({
                variant: "destructive",
                title: "Error",
                description: `Failed to unlink ${type}. Please try again.`,
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Emails Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-xl font-semibold">Email</h2>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <Mail className="w-5 h-5 mt-1 text-gray-500" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{user?.email?.address ?? "No email linked"}</p>
                                    {user?.email?.address && (
                                        <Copy
                                            className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                            onClick={() => copyToClipboard(user?.email?.address || "")}
                                        />
                                    )}
                                </div>
                                {user?.email ? (
                                    <Button variant="ghost" className="text-blue-600" onClick={() => handleUnlink('email', user?.email?.address || "", unlinkEmail)}
                                        disabled={!canRemoveAccount}>
                                        Unlink
                                    </Button>
                                ) : (
                                    <Button variant="ghost" className="text-blue-600" onClick={linkEmail}>
                                        Link Email
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Phone Numbers Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-xl font-semibold">Phone number</h2>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <Phone className="w-5 h-5 mt-1 text-gray-500" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{user?.phone?.number ?? "No phone number linked"}</p>
                                    {user?.phone?.number && (
                                        <Copy
                                            className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                            onClick={() => copyToClipboard(user?.phone?.number || "")}
                                        />
                                    )}
                                </div>
                                {user?.phone ? (
                                    <Button variant="ghost" className="text-blue-600" onClick={() => handleUnlink('phone', user?.phone?.number || "", unlinkPhone)}
                                        disabled={!canRemoveAccount}>
                                        Unlink
                                    </Button>
                                ) : (
                                    <Button variant="ghost" className="text-blue-600" onClick={linkPhone}>
                                        Link Phone
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Wallet Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-xl font-semibold">Wallet</h2>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <Wallet className="w-5 h-5 mt-1 text-gray-500" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">
                                            {user?.wallet?.address
                                                ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                                                : "No wallet linked"}
                                        </p>
                                        {user?.wallet?.address && (
                                            <Copy
                                                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                                onClick={() => copyToClipboard(user?.wallet?.address || "")}
                                            />
                                        )}
                                    </div>
                                </div>
                                {user?.wallet ? (
                                    <Button variant="ghost" className="text-blue-600" onClick={() => handleUnlink('wallet', user?.wallet?.address || "", unlinkWallet)}
                                        disabled={!canRemoveAccount}>
                                        Unlink
                                    </Button>
                                ) : (
                                    <Button variant="ghost" className="text-blue-600" onClick={linkWallet}>
                                        Link Wallet
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Discord Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-xl font-semibold">Discord</h2>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <Image src={"/icons/discord.svg"} alt="Instagram" width={24} height={24} className="mt-1" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{user?.discord?.username ?? "No discord linked"}</p>
                                    {user?.discord?.username && (
                                        <Copy
                                            className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                            onClick={() => copyToClipboard(user?.discord?.username || "")}
                                        />
                                    )}
                                </div>
                                {user?.discord ? (
                                    <Button variant="ghost" className="text-blue-600" onClick={() => handleUnlink('discord', user?.discord?.username || "", unlinkDiscord)}
                                        disabled={!canRemoveAccount}>
                                        Unlink
                                    </Button>
                                ) : (
                                    <Button variant="ghost" className="text-blue-600" onClick={linkDiscord}>
                                        Link Discord
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* X Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-xl font-semibold">X</h2>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <Image src={"/icons/x.svg"} alt="Instagram" width={24} height={24} className="mt-1" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{user?.twitter?.username ?? "No X linked"}</p>
                                    {user?.twitter?.username && (
                                        <Copy
                                            className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                            onClick={() => copyToClipboard(user?.twitter?.username || "")}
                                        />
                                    )}
                                </div>
                                {user?.twitter ? (
                                    <Button variant="ghost" className="text-blue-600" onClick={() => handleUnlink('twitter', user?.twitter?.username || "", unlinkTwitter)}
                                        disabled={!canRemoveAccount}>
                                        Unlink
                                    </Button>
                                ) : (
                                    <Button variant="ghost" className="text-blue-600" onClick={linkTwitter}>
                                        Link X
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Google Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-xl font-semibold">Google</h2>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <Image src={"/icons/google.svg"} alt="Instagram" width={24} height={24} className="mt-1" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{user?.google?.email ?? "No Google linked"}</p>
                                    {user?.google?.email && (
                                        <Copy
                                            className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                            onClick={() => copyToClipboard(user?.google?.email || "")}
                                        />
                                    )}
                                </div>
                                {user?.google ? (
                                    <Button variant="ghost" className="text-blue-600" onClick={() => handleUnlink('google', user?.google?.email || "", unlinkGoogle)}
                                        disabled={!canRemoveAccount}>
                                        Unlink
                                    </Button>
                                ) : (
                                    <Button variant="ghost" className="text-blue-600" onClick={linkGoogle}>
                                        Link Google
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 