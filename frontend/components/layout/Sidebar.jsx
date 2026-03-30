"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    BookOpen,
    Mic2,
    Video,
    BarChart3,
    Users,
    Settings,
    LogOut,
    LayoutDashboard,
    Search,
    Bell,
    Zap,
    Grid,
    PieChart,
    Folder,
    PlayCircle
} from 'lucide-react';
import Logo from '../ui/Logo';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Sidebar = ({ role = "Student" }) => {
    const pathname = usePathname();

    const topItems = [
        { icon: Grid, href: `/dashboard/${role.toLowerCase()}`, label: 'Overview' },
        { icon: Mic2, href: '/simulator', label: 'Speaking' },
        { icon: Folder, href: '/library', label: 'Library' },
        { icon: PlayCircle, href: '/courses', label: 'Courses' },
        { icon: PieChart, href: '/progress', label: 'Analytics' },
        { icon: Settings, href: '/settings', label: 'Settings' },
    ];

    return (
        <aside className="fixed left-8 top-1/2 -translate-y-1/2 w-20 glass-panel rounded-[40px] py-12 flex flex-col items-center justify-between min-h-[85vh] z-[100] border-white/60 shadow-[0_30px_100px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col items-center space-y-12 w-full">
                <div className="hover:scale-110 transition-transform duration-500 cursor-pointer">
                    <Logo size="small" />
                </div>

                <nav className="flex flex-col items-center space-y-6 w-full px-3">
                    {topItems.map((item, idx) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={idx}
                                href={item.href}
                                className={cn(
                                    "p-4 rounded-[22px] transition-all duration-500 relative group w-full flex items-center justify-center",
                                    isActive
                                        ? "bg-black text-white shadow-2xl scale-110"
                                        : "text-gray-400 hover:text-black hover:bg-white/60"
                                )}
                                title={item.label}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                {!isActive && (
                                    <div className="absolute left-[calc(100%+20px)] bg-black text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none shadow-xl border border-white/10 whitespace-nowrap">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}


                </nav>
            </div>

            <div className="flex flex-col items-center space-y-6 w-full px-3">
                <div className="w-8 h-[1px] bg-gray-100" />
                <button onClick={() => signOut({ callbackUrl: '/auth/login' })} className="p-4 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-[22px] transition-all duration-500 group w-full flex items-center justify-center cursor-pointer">
                    <LogOut size={20} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
