"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/AuthProvider";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            if (error.message.includes("Email not confirmed")) {
                setError("Please verify your email before logging in. Check your inbox!");
            } else if (error.message.includes("Invalid")) {
                setError("Invalid email or password");
            } else {
                setError(error.message);
            }
            setLoading(false);
        } else {
            const redirect = searchParams.get("redirect") || "/";
            router.push(redirect);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-semibold mb-2">Email or Username</label>
                <Input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com or username"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
            </Button>
        </form>
    );
}

export default function LoginPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
            <Card className="max-w-md w-full p-8">
                <h1 className="text-3xl font-extrabold text-center mb-2">Welcome Back!</h1>
                <p className="text-center text-gray-600 mb-6">Log in to continue playing</p>

                <Suspense fallback={<div className="text-center text-gray-500 animate-pulse">Loading form...</div>}>
                    <LoginForm />
                </Suspense>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Don't have an account?{" "}
                    <button
                        onClick={() => router.push("/signup")}
                        className="text-primary font-semibold hover:underline"
                    >
                        Sign Up
                    </button>
                </p>
            </Card>
        </div>
    );
}
