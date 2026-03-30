"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, ShieldCheck, GraduationCap, ArrowRight, Check, Mail, Lock, UserCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { clsx } from 'clsx';

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState('Student');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const roles = [
        { id: 'Student', icon: GraduationCap, label: 'Student', desc: 'I want to improve my reading' },
        { id: 'Facilitator', icon: UserCircle, label: 'Facilitator', desc: 'I want to help children read' },
        { id: 'Admin', icon: ShieldCheck, label: 'Admin', desc: 'I manage the platform infrastructure' },
    ];

    return (
        <div className="min-h-screen bg-concentric flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-purple-500/10 blur-[150px] rounded-full animate-pulse decoration-5000" />

            <div className="mb-12 relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <Logo size="normal" isDark={true} />
            </div>

            <div className="glass-panel p-10 md:p-14 rounded-[60px] border-white/40 shadow-3xl w-full max-w-2xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Role Selection */}
                    <div>
                        <div className="mb-10">
                            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Create Account</h1>
                            <p className="text-gray-500 font-medium">Pick your role to get started.</p>
                        </div>

                        <div className="space-y-4">
                            {roles.map((r) => {
                                const isSelected = role === r.id;
                                const Icon = r.icon;
                                return (
                                    <button
                                        key={r.id}
                                        onClick={() => setRole(r.id)}
                                        className={clsx(
                                            "w-full flex items-center p-5 rounded-3xl border transition-all text-left group shadow-sm",
                                            isSelected
                                                ? "bg-black border-black shadow-xl scale-[1.02]"
                                                : "bg-white/40 border-white/60 hover:bg-white/70"
                                        )}
                                    >
                                        <div className={clsx(
                                            "p-3 rounded-2xl mr-4 transition-transform group-hover:scale-110 shadow-sm",
                                            isSelected ? "bg-white text-black" : "bg-white/60 text-gray-500"
                                        )}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className={clsx("font-bold text-sm tracking-tight", isSelected ? "text-white" : "text-gray-900")}>{r.label}</p>
                                            <p className={clsx("text-[10px] font-medium leading-tight mt-1", isSelected ? "text-white/70" : "text-gray-500")}>{r.desc}</p>
                                        </div>
                                        {isSelected && <div className="bg-white rounded-full p-1 text-black"><Check className="h-3 w-3" /></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Actual Form */}
                    <div className="flex flex-col justify-center">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium">
                                {error}
                            </div>
                        )}
                        <form className="space-y-6" onSubmit={async (e) => {
                            e.preventDefault();
                            setError('');
                            setLoading(true);
                            try {
                                const res = await fetch('/api/auth/register', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ name, email, password, role }),
                                });
                                const data = await res.json();
                                if (!res.ok) {
                                    throw new Error(data.message || 'Something went wrong');
                                }
                                router.push('/auth/login');
                            } catch (err) {
                                setError(err.message);
                            } finally {
                                setLoading(false);
                            }
                        }}>
                            <div className="group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3 ml-2 group-focus-within:text-black transition-colors">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="John Doe"
                                        className="w-full pl-14 pr-6 py-4 rounded-3xl bg-white/40 border border-white/60 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white/60 transition-all font-medium shadow-sm"
                                    />
                                </div>
                            </div>
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3 ml-2 group-focus-within:text-black transition-colors">Password</label>
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary flex items-center justify-center group mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : null}
                                {loading ? 'Creating Account...' : 'Get Started'}
                                {!loading && <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>

                        <p className="mt-10 text-center text-sm font-medium text-gray-500">
                            Already have an account? <Link href="/auth/login" className="text-black font-black hover:underline underline-offset-4">Login</Link>
                        </p>
                    </div>
                </div>
            </div>

            <Link href="/" className="mt-12 group flex items-center text-[10px] font-black text-white/50 hover:text-white transition-all uppercase tracking-[0.3em] relative z-10">
                <ArrowLeft className="h-4 w-4 mr-3 group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>
        </div>
    );
}
