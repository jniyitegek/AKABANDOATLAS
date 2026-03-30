"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import DashboardShell from '@/components/layout/DashboardShell';
import { Bell, CheckCircle2, Star, User, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function NotificationsPage() {
    const { data: session } = useSession();
    const name = session?.user?.name || 'User';

    const notifications = [
        { 
            id: 1, 
            title: `Welcome back, ${name}!`, 
            description: "Ready to continue your literacy journey? You have 3 recommended books waiting.", 
            time: 'Just now', 
            icon: User, 
            color: 'text-blue-500', 
            bg: 'bg-blue-50',
            unread: true 
        },
        { 
            id: 2, 
            title: "Weekly Goal Achieved!", 
            description: `Congratulations! You've completed 8 sessions this week. You earned the 'Consistency' badge.`, 
            time: '2h ago', 
            icon: Star, 
            color: 'text-yellow-500', 
            bg: 'bg-yellow-50',
            unread: true 
        },
        { 
            id: 3, 
            title: "New Book Available", 
            description: "'African Folklore: Volume 1' has been added to the library by the administrator.", 
            time: 'Yesterday', 
            icon: BookOpen, 
            color: 'text-black', 
            bg: 'bg-gray-100',
            unread: false 
        },
        { 
            id: 4, 
            title: "System Update", 
            description: "The Reading Engine has been updated for better accuracy. Enjoy a smoother experience!", 
            time: '2 days ago', 
            icon: AlertCircle, 
            color: 'text-red-500', 
            bg: 'bg-red-50',
            unread: false 
        },
    ];

    return (
        <DashboardShell role="Student">
            <div className="mb-12 animate-in fade-in slide-in-from-left duration-700">
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Notifications</h1>
                <p className="text-xl text-gray-500 font-medium">Keep track of your milestones and library updates.</p>
            </div>

            <div className="max-w-4xl space-y-4">
                {notifications.map((n) => (
                    <div 
                        key={n.id} 
                        className={clsx(
                            "glass-panel p-6 rounded-4xl border-white/60 shadow-xl flex items-start space-x-6 transition-all hover:scale-[1.01] hover:shadow-2xl cursor-pointer relative overflow-hidden",
                            n.unread ? "bg-white/80" : "bg-white/40 opacity-80"
                        )}
                    >
                        {n.unread && (
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-black" />
                        )}
                        
                        <div className={clsx("p-4 rounded-2xl shadow-sm flex-shrink-0", n.bg, n.color)}>
                            <n.icon size={24} />
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">{n.title}</h3>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{n.time}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-2xl">
                                {n.description}
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                             {n.unread && (
                                <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
                             )}
                        </div>
                    </div>
                ))}

                {notifications.length === 0 && (
                    <div className="py-20 text-center">
                        <CheckCircle2 size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold text-xl uppercase tracking-widest">You're all caught up!</p>
                    </div>
                )}
            </div>

        </DashboardShell>
    );
}
