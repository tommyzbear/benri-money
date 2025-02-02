import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Home, ChevronDown, Plus, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";


export function AccountDetails() {
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
                                <div>
                                    <p className="font-medium">{user?.email?.address ?? "No email linked"}</p>
                                </div>
                                {user?.email ? (
                                    <Button variant="ghost" className="text-blue-600" onClick={() => {
                                        unlinkEmail(user?.email?.address || "");
                                    }}
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
                                <div>
                                    <p className="font-medium">{user?.phone?.number ?? "No phone number linked"}</p>
                                </div>
                                {user?.phone ? (
                                    <Button variant="ghost" className="text-blue-600" onClick={() => {
                                        unlinkPhone(user?.phone?.number || "");
                                    }}
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
                                    <p className="font-medium">
                                        {user?.wallet?.address
                                            ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                                            : "No wallet linked"}
                                    </p>
                                </div>
                                {user?.wallet ? (
                                    <Button variant="ghost" className="text-blue-600" onClick={() => {
                                        unlinkWallet(user?.wallet?.address || "");
                                    }}
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
                                <div>
                                    <p className="font-medium">{user?.discord?.username ?? "No discord linked"}</p>
                                </div>
                                {user?.discord ? (
                                    <Button variant="ghost" className="text-blue-600" onClick={() => {
                                        unlinkDiscord(user?.discord?.username || "");
                                    }}
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
                                <div>
                                    <p className="font-medium">{user?.twitter?.username ?? "No X linked"}</p>
                                </div>
                                {user?.twitter ? (
                                    <Button variant="ghost" className="text-blue-600" onClick={() => {
                                        unlinkTwitter(user?.twitter?.username || "");
                                    }}
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
                                <div>
                                    <p className="font-medium">{user?.google?.email ?? "No Google linked"}</p>
                                </div>
                                {user?.google ? (
                                    <Button variant="ghost" className="text-blue-600" onClick={() => {
                                        unlinkGoogle(user?.google?.email || "");
                                    }}
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