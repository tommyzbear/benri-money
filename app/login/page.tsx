"use client";

import { useLogin, User } from "@privy-io/react-auth";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();

    const postLogin = async (userData: User) => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error('Failed to send user data to backend');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending user data to backend:', error);
        }
    };

    const { login } = useLogin({
        onComplete: async ({ user }) => {
            console.log(user);

            // Send user data to backend
            await postLogin(user);

            router.push("/");
        },
    });

    return (
        <>
            <Head>
                <title>Login · Wanderer</title>
            </Head>

            <main className="flex min-h-screen min-w-full">
                <div className="flex bg-privy-light-blue flex-1 p-6 justify-center items-center">
                    <div>
                        <div>
                        </div>
                        <div className="mt-6 flex justify-center text-center">
                            <button
                                className="bg-violet-600 hover:bg-violet-700 py-3 px-6 text-white rounded-lg"
                                onClick={login}
                            >
                                Log in
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}