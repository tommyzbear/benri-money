"use client";

import { useLogin, User } from "@privy-io/react-auth";
import Head from "next/head";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

export default function Login() {
    const router = useRouter();

    const postLogin = async (userData: User) => {
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error("Failed to send user data to backend");
            }

            return await response.json();
        } catch (error) {
            toast({
                title: "Error",
                description: "Error sending user data to backend",
                variant: "destructive",
            });
            console.error("Error sending user data to backend:", error);
        }
    };

    const { login } = useLogin({
        onComplete: async ({ user }) => {
            // Send user data to backend
            await postLogin(user);

            router.push("/home");
        },
    });

    return (
        <>
            <Head>
                <title>Login · Wanderer</title>
            </Head>

            <main className="flex min-h-screen min-w-full">
                <div className="flex flex-1 relative">
                    <div className="absolute inset-0 bg-privy-light-blue/90 bg-benri-pattern" />
                    <div className="flex flex-1 p-6 justify-center items-center relative z-10">
                        <div className="flex flex-col justify-between items-center h-full w-full max-w-3xl mx-auto">
                            <div className="flex justify-center mb-8">
                                <span className="h-16 md:h-0"></span>
                            </div>
                            <div className="flex flex-col justify-center items-center text-center">
                                <Image
                                    src="/benri-mascot-edit.png"
                                    alt="Benri Mascot"
                                    width={400}
                                    height={400}
                                    priority
                                    className="rounded-3xl opacity-70"
                                />
                                <button
                                    className="mt-12 py-3 px-8 text-chart-4-foreground tracking-wide text-lg font-bold italic font-libre shadow-primary rounded-2xl bg-chart-4"
                                    onClick={login}
                                >
                                    Log in
                                </button>
                            </div>
                            <div className="flex flex-shrink-0 justify-center items-end opacity-50 mt-12 md:mt-24">
                                <Image
                                    src="/benri-logo-jp.svg"
                                    alt="Benri Logo"
                                    width={75}
                                    height={50}
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
