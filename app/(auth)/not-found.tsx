'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
export default function AuthNotFound() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to home page after a brief delay
        const timeout = setTimeout(() => {
            router.push('/home');
        }, 1500);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <div className="text-center space-y-4">
                <Image
                    src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbTc3YzVmZGZybGZncW1nazI5djE0MnZ2MTB5YmU3Mm95bmxvb2RwZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ji6zzUZwNIuLS/giphy.gif"
                    alt="This is awkward..."
                    width={300}
                    height={300}
                />
                <h1 className="text-4xl font-libre italic text-primary">404</h1>
                <p className="text-muted-foreground">You are not supposed to be here...</p>
            </div>
        </div>
    );
} 