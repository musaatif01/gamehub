"use client";

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { Button } from './ui/Button';

export function Navbar() {
    const { user, signOut } = useAuth();

    return (
        <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary text-white p-1.5 rounded-lg transform transition-transform group-hover:rotate-12">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6"
                        >
                            <path d="M11.47 3.84a6.97 6.97 0 011.06 0l8.64 1.44A2.083 2.083 0 0123 7.234V20a2 2 0 01-2 2H3a2 2 0 01-2-2V7.234c0-1.076.814-1.977 1.83-2.193l8.64-1.2zM2.876 7.427l8.641-1.2 8.64 1.2c.07.01.12.06.12.133V19a.25.25 0 01-.25.25H4a.25.25 0 01-.25-.25V7.56c0-.074.05-.124.12-.133zM12.5 10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-extrabold text-foreground tracking-tight">GameHub</span>
                </Link>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            const isDark = document.documentElement.classList.toggle('dark');
                            localStorage.setItem('theme', isDark ? 'dark' : 'light');
                        }}
                        className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        title="Toggle Theme"
                    >
                        <span className="dark:hidden">🌙</span>
                        <span className="hidden dark:inline">☀️</span>
                    </button>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-700 dark:text-gray-300 hidden sm:block">
                                Hi, {user.user_metadata?.username || user.email?.split('@')[0]}!
                            </span>
                            <Button variant="ghost" size="sm" onClick={signOut}>
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Log In</Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="primary" size="sm">Sign Up</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
