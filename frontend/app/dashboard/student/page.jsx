"use client";

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { useSession } from 'next-auth/react';
import { BookOpen, Mic2, Star, TrendingUp, Clock, ArrowRight, Play, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
    const { data: session } = useSession();
    const [scoreData, setScoreData] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Fetch books and scores in parallel
                const [booksRes, ...rest] = await Promise.all([
                    fetch('/api/books'),
                    session?.user?.id ? fetch(`/api/scores/${session.user.id}`) : Promise.resolve(null),
                ]);

                const booksData = await booksRes.json();
                if (booksData.success) setBooks(booksData.books.slice(0, 2));

                if (rest[0]) {
                    const scoreRes = rest[0];
                    const scoreJson = await scoreRes.json();
                    if (scoreJson.success) setScoreData(scoreJson.score);
                }
            } catch (err) {
                console.error('Dashboard fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [session]);

    const formatDuration = (seconds) => {
        if (!seconds || seconds === 0) return '0s';
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
        const hrs = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
    };

    const practiceTime = formatDuration(scoreData?.totalDurationSeconds);

    const fluencyLabel = (typeof scoreData?.averageFluency === 'number')
        ? scoreData.averageFluency >= 80 ? 'Excellent'
            : scoreData.averageFluency >= 60 ? 'Good' : 'Developing'
        : 'N/A';

    const stats = [
        { label: 'Sessions Completed', value: scoreData?.totalSessions ?? '0', icon: BookOpen },
        { label: 'Accuracy', value: `${scoreData?.overallAccuracy ?? 0}%`, icon: Star },
        { label: 'Fluency', value: fluencyLabel, icon: TrendingUp },
        { label: 'Practice Time', value: practiceTime, icon: Clock },
    ];

    return (
        <DashboardShell>
            <div className="mb-10 animate-in fade-in slide-in-from-left duration-700">
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
                    Let's Talk from the Start
                </h1>
                <p className="text-xl text-gray-500 font-medium">
                    Welcome back, {session?.user?.name?.split(' ')[0] ?? 'Reader'}. Ready to continue your reading journey?
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Featured Practice Card */}
                    <div className="glass-panel rounded-5xl p-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-6 z-10">
                                <div className="inline-flex bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                                    New Lesson
                                </div>
                                <h2 className="text-4xl font-bold leading-tight">Master Your <br /> Pronunciation</h2>
                                <p className="text-gray-500 font-medium text-lg leading-relaxed">
                                    Master your pronunciation with real-time feedback and AI coaching.
                                </p>
                                <Link href="/simulator" className="btn-primary inline-flex items-center space-x-2 group">
                                    <span>Start Now</span>
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            <div className="relative h-64 md:h-80 w-full rounded-4xl overflow-hidden glass-panel border-white/40 shadow-xl">
                                <img
                                    src="/reading 1.jpg"
                                    className="h-full w-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700"
                                    alt="Learning"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h3 className="text-2xl font-bold flex items-center">
                                <TrendingUp className="mr-3 text-gray-400" />
                                Your Progress
                            </h3>
                            <Link href="/progress" className="text-sm font-bold text-gray-400 hover:text-black transition-colors">Details</Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats.map((stat, i) => (
                                <div key={i} className="glass-panel p-6 rounded-4xl flex flex-col items-center text-center group hover:bg-white hover:scale-105 transition-all duration-300">
                                    <div className="bg-gray-100 p-3 rounded-2xl mb-4 group-hover:bg-black group-hover:text-white transition-colors">
                                        <stat.icon size={20} />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 group-hover:text-black">{stat.value}</p>
                                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Books Preview */}
                    <div>
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h3 className="text-2xl font-bold flex items-center">
                                <BookOpen className="mr-3 text-gray-400" />
                                Library Books
                            </h3>
                            <Link href="/library" className="text-sm font-bold text-gray-400 hover:text-black transition-colors">View All</Link>
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
                            </div>
                        ) : books.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {books.map(book => (
                                    <Link key={book._id} href="/library">
                                        <BookCard
                                            title={book.title}
                                            author={book.author}
                                            image={book.coverImage || '/reading 2.avif'}
                                        />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-panel p-8 rounded-4xl text-center">
                                <BookOpen className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                                <p className="text-gray-400 font-semibold">No books in the library yet.</p>
                                <Link href="/library" className="text-sm font-bold text-black mt-2 inline-block hover:underline">Browse Library</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Achievement Card */}
                    <div className="bg-black text-white p-8 rounded-5xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <Star size={80} fill="currentColor" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-6 uppercase tracking-widest text-[10px] opacity-60">Achievement</h3>
                            <div className="flex flex-col items-center text-center">
                                <div className="h-20 w-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6">
                                    <Star className="h-10 w-10 text-white" fill="currentColor" />
                                </div>
                                <h4 className="text-2xl font-bold">
                                    {scoreData?.totalSessions >= 7 ? '7+ Sessions!' : `${scoreData?.totalSessions ?? 0} Sessions`}
                                </h4>
                                <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                                    {scoreData?.totalSessions >= 7
                                        ? "You're on fire! Keep reading to unlock new badges."
                                        : "Complete more sessions to unlock achievements."}
                                </p>
                                <Link href="/progress" className="mt-8 w-full bg-white text-black py-3 rounded-2xl font-bold hover:bg-gray-200 transition-colors block text-center">
                                    View Progress
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Card */}
                    <div className="glass-panel p-8 rounded-5xl">
                        <h3 className="text-xl font-bold mb-6">Session Stats</h3>
                        <div className="space-y-5">
                            <StatRow label="Total Sessions" value={scoreData?.totalSessions ?? 0} />
                            <StatRow label="Avg. Accuracy" value={`${scoreData?.overallAccuracy ?? 0}%`} />
                            <StatRow label="Avg. Fluency" value={`${scoreData?.averageFluency ?? 0}%`} />
                            <StatRow label="Time Practiced" value={practiceTime} />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

function BookCard({ title, author, image }) {
    return (
        <div className="glass-panel p-4 rounded-4xl flex group hover:shadow-xl transition-all duration-500 cursor-pointer hover:-translate-y-1">
            <div className="h-28 w-20 rounded-2xl overflow-hidden glass-panel border-white/40 flex-shrink-0 shadow-md">
                <img src={image} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt={title} />
            </div>
            <div className="flex flex-col justify-center ml-4 flex-1">
                <h4 className="font-bold text-gray-900 leading-tight group-hover:text-black transition-colors line-clamp-2">{title}</h4>
                <p className="text-[10px] font-medium text-gray-400 mt-1">{author}</p>
                <div className="mt-3 inline-flex items-center text-[10px] font-bold text-gray-400">
                    <Play size={10} fill="currentColor" className="mr-1" /> Practice Now
                </div>
            </div>
        </div>
    );
}

function StatRow({ label, value }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-black text-gray-900">{value}</span>
        </div>
    );
}
