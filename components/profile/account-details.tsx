"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Wallet, Copy } from "lucide-react";
import { ConnectedWallet, useMfaEnrollment, usePrivy, User, useSolanaWallets, useWallets } from "@privy-io/react-auth";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { NetworkIcon } from "@/components/network-icon";
import { baseSepolia, sepolia } from "viem/chains";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { config } from "@/lib/wallet/config";
import { getNetworkByChainId, shortenAddress } from "@/lib/utils";
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

function AccountDetailsSkeleton() {
    return (
        <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <Skeleton className="h-7 w-32" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4">
                            <Skeleton className="h-6 w-6" />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-5 w-48" />
                                    </div>
                                    <Skeleton className="h-9 w-24" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function AccountDetails() {
    const { toast } = useToast();
    const {
        ready,
        authenticated,
        user,
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
        exportWallet,
    } = usePrivy();

    const { wallets, ready: walletsReady } = useWallets();
    const [privyWallet, setPrivyWallet] = useState<ConnectedWallet | undefined>(undefined);
    const [externalWalletAddresses, setExternalWalletAddresses] = useState<string[]>([]);
    const { showMfaEnrollmentModal } = useMfaEnrollment();

    useEffect(() => {
        if (ready && wallets.length > 0) {
            setPrivyWallet(wallets.find((wallet) => wallet.walletClientType === "privy"));
            setExternalWalletAddresses(wallets.filter((wallet) => wallet.walletClientType !== "privy").map((wallet) => wallet.address));
        }
    }, [ready, wallets]);

    if (!ready || !walletsReady) {
        return <AccountDetailsSkeleton />;
    }

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
            console.error("Failed to copy:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to copy to clipboard",
            });
        }
    };

    const handleUnlink = async (
        type: string,
        value: string,
        unlinkFn: (value: string) => Promise<User>
    ) => {
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

    const handleSwitchNetwork = async (chainId: string) => {
        if (!walletsReady) return;
        try {
            // await wallets[0].switchChain(chainId === "84532" ? Number(baseSepolia.id) : sepolia.id);
            await privyWallet?.switchChain(Number(chainId));
            toast({
                description: "Network switched successfully",
            });
        } catch (error) {
            console.error("Network switch error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to switch network",
            });
        }
    };

    const getCurrentNetwork = () => {
        if (!walletsReady) return "Unknown";

        return getNetworkByChainId(privyWallet?.chainId || "");
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* Privy Wallet Section */}
            <motion.div variants={cardVariants}>
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-xl font-semibold">Embedded Wallet</h2>
                    </CardHeader>
                    <CardContent>
                        <motion.div
                            className="flex items-start gap-4"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Wallet className="w-5 h-5 mt-1 text-gray-500" />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">
                                            {privyWallet
                                                ? shortenAddress(privyWallet.address)
                                                : "No wallet linked"}
                                        </p>
                                        {privyWallet && (
                                            <Copy
                                                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                                onClick={() =>
                                                    copyToClipboard(privyWallet.address)
                                                }
                                            />
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="text-blue-600"
                                        onClick={exportWallet}
                                    >
                                        Export Wallet
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* MFA Section */}
            <motion.div variants={cardVariants}>
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-xl font-semibold">{user?.mfaMethods && user?.mfaMethods.length > 0 ? "(Enabled) Multi-Factor Authentication" : "Multi-Factor Authentication"}</h2>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                            {user?.mfaMethods && user?.mfaMethods.length > 0 ? (
                                user.mfaMethods.map((method) => (
                                    <p className="font-medium" key={method}>
                                        {method === "totp" ? "Authenticator App" : method.toUpperCase()}
                                    </p>
                                ))
                            ) : (
                                <p className="font-medium">
                                    MFA is disabled
                                </p>
                            )}
                        </div>
                        {!user?.mfaMethods || user?.mfaMethods.length === 0 && (
                            <Button
                                variant="ghost"
                                className="text-blue-600"
                                onClick={showMfaEnrollmentModal}
                            >
                                Enable MFA
                            </Button>
                        )}

                        {user?.mfaMethods && user?.mfaMethods.length > 0 && (
                            <Button
                                variant="ghost"
                                className="text-blue-600"
                                onClick={showMfaEnrollmentModal}
                            >
                                Configure MFA
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Emails Section */}
            <motion.div variants={cardVariants}>
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-xl font-semibold">Email</h2>
                    </CardHeader>
                    <CardContent>
                        <motion.div
                            className="flex items-start gap-4"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Mail className="w-5 h-5 mt-1 text-gray-500" />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">
                                            {user?.email?.address ?? "No email linked"}
                                        </p>
                                        {user?.email?.address && (
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Copy
                                                    className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                                    onClick={() =>
                                                        copyToClipboard(user?.email?.address || "")
                                                    }
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {user?.email ? (
                                            <Button
                                                variant="ghost"
                                                className="text-blue-600"
                                                onClick={() =>
                                                    handleUnlink(
                                                        "email",
                                                        user?.email?.address || "",
                                                        unlinkEmail
                                                    )
                                                }
                                                disabled={!canRemoveAccount}
                                            >
                                                Unlink
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                className="text-blue-600"
                                                onClick={linkEmail}
                                            >
                                                Link Email
                                            </Button>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Phone Numbers Section */}
            <motion.div variants={cardVariants}>
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-xl font-semibold">Phone number</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4">
                            <Phone className="w-5 h-5 mt-1 text-gray-500" />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">
                                            {user?.phone?.number ?? "No phone number linked"}
                                        </p>
                                        {user?.phone?.number && (
                                            <Copy
                                                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                                onClick={() =>
                                                    copyToClipboard(user?.phone?.number || "")
                                                }
                                            />
                                        )}
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {user?.phone ? (
                                            <Button
                                                variant="ghost"
                                                className="text-blue-600"
                                                onClick={() =>
                                                    handleUnlink(
                                                        "phone",
                                                        user?.phone?.number || "",
                                                        unlinkPhone
                                                    )
                                                }
                                                disabled={!canRemoveAccount}
                                            >
                                                Unlink
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                className="text-blue-600"
                                                onClick={linkPhone}
                                            >
                                                Link Phone
                                            </Button>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Wallet Section */}
            <motion.div variants={cardVariants}>
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-xl font-semibold">External Wallets</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4">
                            <Wallet className="w-5 h-5 mt-1 text-gray-500" />
                            <div className="flex-1">
                                {externalWalletAddresses.length > 0 ? externalWalletAddresses.map((address) => (
                                    <div key={address} className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">

                                                {address && (
                                                    <Copy
                                                        className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                                        onClick={() =>
                                                            copyToClipboard(address)
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                variant="ghost"
                                                className="text-blue-600"
                                                onClick={() =>
                                                    handleUnlink(
                                                        "wallet",
                                                        address,
                                                        unlinkWallet
                                                    )
                                                }
                                                disabled={!canRemoveAccount}
                                            >
                                                Unlink
                                            </Button>
                                        </motion.div>
                                    </div>
                                )) : (
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium">
                                            No wallet linked
                                        </p>
                                        <Button
                                            variant="ghost"
                                            className="text-blue-600"
                                            onClick={linkWallet}
                                        >
                                            Link Wallet
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {externalWalletAddresses.length > 0 && (
                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    className="text-blue-600 w-full"
                                    onClick={linkWallet}
                                >
                                    Link Additional Wallet
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Discord Section */}
            <motion.div variants={cardVariants}>
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-xl font-semibold">Discord</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4">
                            <Image
                                src={"/icons/discord.svg"}
                                alt="Instagram"
                                width={24}
                                height={24}
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">
                                            {user?.discord?.username ?? "No discord linked"}
                                        </p>
                                        {user?.discord?.username && (
                                            <Copy
                                                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                                onClick={() =>
                                                    copyToClipboard(user?.discord?.username || "")
                                                }
                                            />
                                        )}
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {user?.discord ? (
                                            <Button
                                                variant="ghost"
                                                className="text-blue-600"
                                                onClick={() =>
                                                    handleUnlink(
                                                        "discord",
                                                        user?.discord?.username || "",
                                                        unlinkDiscord
                                                    )
                                                }
                                                disabled={!canRemoveAccount}
                                            >
                                                Unlink
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                className="text-blue-600"
                                                onClick={linkDiscord}
                                            >
                                                Link Discord
                                            </Button>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* X Section */}
            <motion.div variants={cardVariants}>
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-xl font-semibold">X</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4">
                            <Image
                                src={"/icons/x.svg"}
                                alt="Instagram"
                                width={24}
                                height={24}
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">
                                            {user?.twitter?.username ?? "No X linked"}
                                        </p>
                                        {user?.twitter?.username && (
                                            <Copy
                                                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                                onClick={() =>
                                                    copyToClipboard(user?.twitter?.username || "")
                                                }
                                            />
                                        )}
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {user?.twitter ? (
                                            <Button
                                                variant="ghost"
                                                className="text-blue-600"
                                                onClick={() =>
                                                    handleUnlink(
                                                        "twitter",
                                                        user?.twitter?.username || "",
                                                        unlinkTwitter
                                                    )
                                                }
                                                disabled={!canRemoveAccount}
                                            >
                                                Unlink
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                className="text-blue-600"
                                                onClick={linkTwitter}
                                            >
                                                Link X
                                            </Button>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Google Section */}
            <motion.div variants={cardVariants}>
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-xl font-semibold">Google</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4">
                            <Image
                                src={"/icons/google.svg"}
                                alt="Instagram"
                                width={24}
                                height={24}
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">
                                            {user?.google?.email ?? "No Google linked"}
                                        </p>
                                        {user?.google?.email && (
                                            <Copy
                                                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                                onClick={() =>
                                                    copyToClipboard(user?.google?.email || "")
                                                }
                                            />
                                        )}
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {user?.google ? (
                                            <Button
                                                variant="ghost"
                                                className="text-blue-600"
                                                onClick={() =>
                                                    handleUnlink(
                                                        "google",
                                                        user?.google?.email || "",
                                                        unlinkGoogle
                                                    )
                                                }
                                                disabled={!canRemoveAccount}
                                            >
                                                Unlink
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                className="text-blue-600"
                                                onClick={linkGoogle}
                                            >
                                                Link Google
                                            </Button>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Network Section */}
            <motion.div variants={cardVariants}>
                <Card className="hover:shadow-md transition-shadow duration-200 mb-20">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-xl font-semibold">Networks</h2>
                    </CardHeader>
                    <CardContent>
                        <Select
                            value={getCurrentNetwork()}
                            onValueChange={handleSwitchNetwork}
                            disabled={!wallets[0]}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select network">
                                    <div className="flex items-center space-x-3">
                                        <NetworkIcon
                                            chain={getCurrentNetwork()}
                                            className="w-6 h-6"
                                        />
                                        <div>
                                            <p className="font-medium">{getCurrentNetwork()}</p>
                                        </div>
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {config.chains.map((chain) => (
                                    <SelectItem key={chain.id} value={chain.id.toString()}>
                                        <div className="flex items-center space-x-3">
                                            <NetworkIcon chain={chain.name} className="w-6 h-6" />
                                            <div>
                                                <p className="font-medium">{chain.name}</p>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
