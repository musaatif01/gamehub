"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
    signIn: (emailOrUsername: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                syncProfile(session.user);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                syncProfile(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Helper to ensure profile exists in user_profiles
    const syncProfile = async (user: User) => {
        const username = user.user_metadata?.username || user.email?.split('@')[0];
        if (!username) return;

        await supabase.from('user_profiles').upsert({
            id: user.id,
            username: username,
            email: user.email,
        }, { onConflict: 'id' });
    };

    const signUp = async (email: string, password: string, username: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        return { error };
    };

    const signIn = async (emailOrUsername: string, password: string) => {
        const isEmail = emailOrUsername.includes('@');

        if (isEmail) {
            const { error } = await supabase.auth.signInWithPassword({
                email: emailOrUsername,
                password,
            });
            return { error };
        } else {
            // SAFE client-side username lookup
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('email')
                .eq('username', emailOrUsername)
                .single();

            if (profileError || !profile) {
                return { error: { message: 'Username not found' } };
            }

            // Sign in with the synced email
            const { error } = await supabase.auth.signInWithPassword({
                email: profile.email,
                password,
            });

            return { error };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        user,
        session,
        signUp,
        signIn,
        signOut,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
