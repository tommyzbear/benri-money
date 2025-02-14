"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Wallet, Copy } from "lucide-react";
import { usePrivy, User } from "@privy-io/react-auth";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
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
        exportWallet
    } = usePrivy();

    if (!ready) {
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
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
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
                                        <p className="font-medium">{user?.email?.address ?? "No email linked"}</p>
                                        {user?.email?.address && (
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Copy
                                                    className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                                    onClick={() => copyToClipboard(user?.email?.address || "")}
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        {user?.email ? (
                                            <Button
                                                variant="ghost"
                                                className="text-blue-600"
                                                onClick={() => handleUnlink('email', user?.email?.address || "", unlinkEmail)}
                                                disabled={!canRemoveAccount}
                                            >
                                                Unlink
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" className="text-blue-600" onClick={linkEmail}>
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
                                        <p className="font-medium">{user?.phone?.number ?? "No phone number linked"}</p>
                                        {user?.phone?.number && (
                                            <Copy
                                                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                                onClick={() => copyToClipboard(user?.phone?.number || "")}
                                            />
                                        )}
                                    </div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                        {user?.wallet?.address && (
                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    className="w-full text-blue-600"
                                    onClick={exportWallet}
                                >
                                    Export Wallet
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
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
} 