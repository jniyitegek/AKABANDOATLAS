"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ArrowLeft, ArrowRight, Github, Mail, Lock, Chrome, Loader2 } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError(res.error);
            } else {
                router.push('/dashboard/student');
                router.refresh();
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        setGoogleLoading(true);
        signIn('google', { callbackUrl: '/dashboard/student' });
    };
    return (
        <div className="min-h-screen bg-concentric flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse decoration-5000" />
            </div>

            <div className="mb-12 relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <Logo size="normal" isDark={true} />
            </div>

            <div className="glass-panel p-10 md:p-12 rounded-[60px] border-white/40 shadow-3xl w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Welcome Back</h1>
                    <p className="text-gray-500 font-medium">Pick up where you left off</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3 ml-2 group-focus-within:text-black transition-colors">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="name@example.com"
                                    className="w-full pl-14 pr-6 py-4 rounded-3xl bg-white/40 border border-white/60 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white/60 transition-all font-medium shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="group">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2 group-focus-within:text-black transition-colors">Password</label>
                                <Link href="#" className="text-[10px] font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest mr-2">Forgot?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-6 py-4 rounded-3xl bg-white/40 border border-white/60 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white/60 transition-all font-medium shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || googleLoading}
                        className="w-full btn-primary flex items-center justify-center group mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : null}
                        {loading ? 'Signing In...' : 'Sign In'}
                        {!loading && <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="relative mt-12 mb-10">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-white/50 backdrop-blur-md px-4 text-gray-600 font-black uppercase tracking-widest text-[9px] rounded-full">or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* <button className="flex items-center justify-center py-4 px-4 bg-white/40 border border-white/60 rounded-2xl hover:bg-white/70 transition-all font-black text-[10px] text-gray-600 uppercase tracking-widest group shadow-sm disabled:opacity-70 cursor-not-allowed">
                        <Github className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform text-black" /> Github
                    </button> */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading || googleLoading}
                        className="flex items-center justify-center py-4 px-4 bg-white/40 border border-white/60 rounded-2xl hover:bg-white/70 transition-all font-black text-[10px] text-gray-600 uppercase tracking-widest group shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {googleLoading ? (
                            <Loader2 className="h-4 w-4 mr-3 animate-spin text-gray-400" />
                        ) : (
                            <Chrome className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform text-red-500" />
                        )}
                        Google
                    </button>
                </div>

                <p className="mt-12 text-center text-sm font-medium text-gray-500">
                    Don't have an account? <Link href="/auth/register" className="text-black font-black hover:underline underline-offset-4">Create one</Link>
                </p>
            </div>

            <Link href="/" className="mt-12 group flex items-center text-[10px] font-black text-white/50 hover:text-white transition-all uppercase tracking-[0.3em] relative z-10">
                <ArrowLeft className="h-4 w-4 mr-3 group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>
        </div>
    );
}
