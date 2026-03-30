"use client";

import React from 'react';
import Sidebar from './Sidebar';
import { Menu, Bell, Search, User, ChevronDown, Command, Star, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const DashboardShell = ({ children }) => {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    const [showSearch, setShowSearch] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [books, setBooks] = React.useState([]);
    const [filteredResults, setFilteredResults] = React.useState([]);

    React.useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await fetch('/api/books');
                const data = await res.json();
                if (data.success) setBooks(data.books);
            } catch (e) { console.error(e); }
        };
        fetchBooks();
    }, []);

    React.useEffect(() => {
        if (searchQuery.length > 1) {
            const results = books.filter(b => 
                b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.author.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 5);
            setFilteredResults(results);
        } else {
            setFilteredResults([]);
        }
    }, [searchQuery, books]);

    const role = session?.user?.role || 'Student';
    const name = session?.user?.name || 'User';
    const image = session?.user?.image || '/reading 3.jpeg';

    const tabs = [
        { name: 'Dashboard', href: `/dashboard/${role.toLowerCase()}` },
        { name: 'Speaking', href: '/simulator' },
        { name: 'Library', href: '/library' },
        { name: 'Progress', href: '/progress' },
        { name: 'Courses', href: '/courses' },
        { name: 'Settings', href: '/settings' },
    ];

    const notifications = [
        { id: 1, text: `Welcome back, ${name}! Ready to read?`, time: 'Just now', icon: User, color: 'text-blue-500' },
        { id: 2, text: `You've completed 8 sessions. Keep it up!`, time: '2h ago', icon: Star, color: 'text-yellow-500' },
        { id: 3, text: "New book 'African Folklore' added to Library.", time: 'Yesterday', icon: Bell, color: 'text-black' },
    ];

    return (
        <div className="flex min-h-screen bg-transparent">
            <Sidebar role={role} />

            <div className="flex-1 flex flex-col pl-32 pr-10 py-10 animate-in fade-in duration-1000">
                {/* Top Navigation Bar */}
                <header className="flex items-center justify-between mb-16 relative z-10">
                    <div className="flex items-center">
                        <div className="glass-panel p-1.5 rounded-[30px] border-white/60 shadow-xl flex items-center">
                            {tabs.map((tab) => {
                                const isActive = pathname === tab.href;
                                return (
                                    <Link
                                        key={tab.href}
                                        href={tab.href}
                                        className={`px-8 py-3.5 rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isActive
                                            ? 'bg-black text-white shadow-2xl scale-[1.02]'
                                            : 'text-gray-400 hover:text-black hover:bg-white/40'
                                            }`}
                                    >
                                        {tab.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className={`flex items-center glass-pill px-6 py-3 border-white/60 shadow-lg transition-all duration-500 ${showSearch ? 'w-64 bg-white ring-4 ring-black/5' : 'w-auto'}`}>
                            <button onClick={() => setShowSearch(!showSearch)} className="hover:scale-110 transition-transform">
                                <Search className={`h-4 w-4 ${showSearch ? 'text-black' : 'text-gray-400'} transition-colors`} />
                            </button>
                            <div className="relative flex-1 flex items-center">
                                {showSearch ? (
                                    <div className="flex-1">
                                        <input 
                                            autoFocus
                                            className="ml-4 bg-transparent border-none outline-none text-[10px] font-bold w-full placeholder:text-gray-300" 
                                            placeholder="SEARCH BOOKS, USERS..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        {/* Search Results Dropdown */}
                                        {filteredResults.length > 0 && (
                                            <div className="absolute top-12 left-0 w-64 glass-panel rounded-3xl p-4 shadow-3xl border-white/60 animate-in slide-in-from-top-2 duration-300 z-50">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Library Hits</p>
                                                <div className="space-y-2">
                                                    {filteredResults.map(book => (
                                                        <Link 
                                                            key={book._id} 
                                                            href={`/library?search=${encodeURIComponent(book.title)}`}
                                                            onClick={() => setShowSearch(false)}
                                                            className="flex items-center space-x-3 p-2 hover:bg-black/5 rounded-2xl transition-all group"
                                                        >
                                                            <div className="h-8 w-6 rounded-lg overflow-hidden flex-shrink-0">
                                                                <img src={book.coverImage || '/reading 2.avif'} className="h-full w-full object-cover" />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-[10px] font-bold text-gray-900 truncate">{book.title}</span>
                                                                <span className="text-[8px] font-medium text-gray-400 truncate uppercase">{book.author}</span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-4 w-[1px] bg-gray-200 mx-6" />
                                )}
                            </div>
                            
                            {!showSearch && (
                                <div className="relative">
                                    <button onClick={() => setShowNotifications(!showNotifications)} className="relative hover:scale-110 transition-all">
                                        <Bell className={`h-4 w-4 ${showNotifications ? 'text-black' : 'text-gray-400'} transition-colors`} />
                                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-black border-2 border-white rounded-full" />
                                    </button>

                                    {/* Notifications Dropdown */}
                                    {showNotifications && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                                            <div className="absolute top-12 right-0 w-80 glass-panel rounded-4xl p-6 shadow-3xl border-white/60 animate-in slide-in-from-right-4 duration-300 z-20">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Recent Activity</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    {notifications.map((n) => (
                                                        <div key={n.id} className="flex space-x-4 p-3 hover:bg-white/60 rounded-2xl transition-all cursor-pointer group">
                                                            <div className={`p-2 bg-gray-50 rounded-xl ${n.color} shadow-sm group-hover:bg-white transition-colors`}>
                                                                <n.icon size={14} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <p className="text-[10px] font-bold text-gray-800 leading-tight">{n.text}</p>
                                                                <span className="text-[8px] font-medium text-gray-400 mt-1">{n.time}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Link 
                                                    href="/notifications"
                                                    onClick={() => setShowNotifications(false)}
                                                    className="block w-full mt-6 py-3 bg-gray-50 hover:bg-white rounded-2xl text-[8px] font-black uppercase tracking-widest text-center text-gray-400 hover:text-black transition-all"
                                                >
                                                    View All Notifications
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button 
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-4 glass-pill pr-4 pl-3 py-2 border-white/60 shadow-lg group cursor-pointer hover:bg-white transition-all"
                            >
                                <div className="h-10 w-10 rounded-2xl overflow-hidden border border-white/40 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                                    <img
                                        src={image}
                                        alt="User"
                                        className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    />
                                </div>
                                <div className="flex flex-col text-left">
                                    {status === "loading" ? (
                                        <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
                                    ) : (
                                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">{name}</span>
                                    )}
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{role}</span>
                                </div>
                                <ChevronDown className={`h-3 w-3 text-gray-300 group-hover:text-black transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''} lg:ml-2`} />
                            </button>

                            {/* User Profile Dropdown */}
                            {showUserMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                                    <div className="absolute top-16 right-0 w-56 glass-panel rounded-3xl p-4 shadow-3xl border-white/60 animate-in slide-in-from-top-4 duration-300 z-20">
                                        <div className="space-y-1">
                                            <Link 
                                                href="/settings"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center space-x-3 p-3 hover:bg-black/5 rounded-2xl transition-all group"
                                            >
                                                <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:text-black group-hover:bg-white transition-colors">
                                                    <Settings size={14} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Settings</span>
                                            </Link>
                                            
                                            <button 
                                                onClick={() => signOut({ callbackUrl: '/' })}
                                                className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 rounded-2xl transition-all group"
                                            >
                                                <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:text-red-500 group-hover:bg-white transition-colors">
                                                    <LogOut size={14} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 group-hover:text-red-600">Log out</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1">
                    <div className="w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardShell;
