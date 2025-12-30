"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error during auth callback:', error);
                router.push('/login?error=verification_failed');
                return;
            }

            if (data.session) {
                router.push('/');
            } else {
                router.push('/login');
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
                <p className="text-white text-xl font-semibold">Verifying your email...</p>
            </div>
        </div>
    );
}
