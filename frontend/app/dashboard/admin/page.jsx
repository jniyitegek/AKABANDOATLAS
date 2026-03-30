"use client";

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import ContentManager from '@/components/admin/ContentManager';
import {
    Users, Settings, Database, ShieldCheck, Search, Filter,
    MoreHorizontal, Mail, Trash2, Edit2, Activity, Plus,
    ArrowUpRight, Server, Loader2
} from 'lucide-react';
import { clsx } from 'clsx';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState('users');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                const data = await res.json();
                if (data.success) setUsers(data.users);
            } catch (err) {
                console.error('Failed to fetch users:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Real computed stats
    const totalUsers = users.length;
    const studentCount = users.filter(u => u.role === 'Student').length;
    const facilitatorCount = users.filter(u => u.role === 'Facilitator').length;
    const adminCount = users.filter(u => u.role === 'Admin').length;

    return (
        <DashboardShell role="Admin">
            <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-left duration-700">
                <div>
                    <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Control Center</h1>
                    <p className="text-xl text-gray-500 font-medium">Manage the heartbeat of Akabando Atlas platform.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-white/40 backdrop-blur-md border border-white/40 p-1 rounded-full shadow-sm w-fit">
                        <button onClick={() => setActiveView('users')} className={clsx('px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all', activeView === 'users' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:text-black')}>Users</button>
                        <button onClick={() => setActiveView('content')} className={clsx('px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all', activeView === 'content' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:text-black')}>Content</button>
                    </div>
                </div>
            </div>

            {activeView === 'content' ? (
                <ContentManager />
            ) : (
                <>
                    {/* Real Admin Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        <AdminStat label="Total Users" value={loading ? '...' : totalUsers} icon={Users} trend={`${studentCount} students`} />
                        <AdminStat label="Facilitators" value={loading ? '...' : facilitatorCount} icon={Activity} trend="Active" />
                        <AdminStat label="Security" value="Secure" icon={ShieldCheck} trend="0 Threats" />
                        <AdminStat label="Admins" value={loading ? '...' : adminCount} icon={Settings} trend="Super users" />
                    </div>

                    {/* User Management Table */}
                    <div className="glass-panel rounded-[60px] border-white/40 shadow-2xl overflow-hidden">
                        <div className="p-10 border-b border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <h3 className="font-bold text-gray-900 text-2xl">Global Directory</h3>
                            <div className="flex items-center gap-4">
                                <div className="glass-pill flex-1 flex items-center px-6 py-0 border-white/40">
                                    <Search className="h-4 w-4 text-gray-400 mr-3" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Filter users..."
                                        className="w-56 py-3 bg-transparent focus:outline-none font-semibold text-sm text-gray-700 placeholder:text-gray-400"
                                    />
                                </div>
                                <button className="h-12 w-12 glass-panel rounded-2xl flex items-center justify-center text-gray-400 hover:text-black transition-all border-white/40 shadow-sm">
                                    <Filter className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto p-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="animate-spin h-10 w-10 text-gray-400" />
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-20">
                                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                    <p className="text-gray-400 font-bold text-lg">No users found.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                        <tr>
                                            <th className="px-10 py-8">User Identity</th>
                                            <th className="px-10 py-8">Access Level</th>
                                            <th className="px-10 py-8">Joined</th>
                                            <th className="px-10 py-8 text-right">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {filteredUsers.map(user => (
                                            <tr key={user._id} className="hover:bg-white/30 transition-all group">
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center">
                                                        <div className="h-14 w-14 rounded-2xl overflow-hidden mr-5 shadow-lg border border-white/40 bg-gray-100 flex items-center justify-center text-xl font-black text-gray-400">
                                                            {user.image
                                                                ? <img src={user.image} className="w-full h-full object-cover rounded-xl" alt={user.name} />
                                                                : <img src="/reading 4.jpeg" className="w-full h-full object-cover" alt={user.name} />
                                                            }
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-lg leading-tight group-hover:text-black">{user.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <span className={clsx(
                                                        'active-pill px-5 py-2 text-[10px] font-black uppercase tracking-widest',
                                                        user.role === 'Admin' ? 'bg-black text-white' :
                                                        user.role === 'Facilitator' ? 'bg-gray-400 text-white' : 'bg-gray-200 text-gray-600'
                                                    )}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-7 text-sm font-black text-gray-400 uppercase tracking-widest">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-10 py-7 text-right">
                                                    <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="h-10 w-10 glass-panel rounded-xl flex items-center justify-center text-gray-400 hover:text-black transition-all border-white/40 shadow-sm"><Edit2 className="h-4 w-4" /></button>
                                                        <button className="h-10 w-10 glass-panel rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-all border-white/40 shadow-sm"><Trash2 className="h-4 w-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="p-10 border-t border-white/20 flex items-center justify-between">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                {filteredUsers.length} of {users.length} users shown
                            </p>
                            <button className="text-[10px] font-black text-gray-900 hover:underline uppercase tracking-[0.2em] flex items-center gap-2">
                                Export CSV <ArrowUpRight className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </DashboardShell>
    );
}

function AdminStat({ label, value, icon: Icon, trend }) {
    return (
        <div className="glass-panel p-10 rounded-[60px] border-white/40 shadow-xl group hover:bg-white transition-all cursor-default relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <img src="/reading 5.jpg" className="w-full h-full object-cover" alt="decor" />
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="h-24 w-24" />
            </div>
            <div className="h-14 w-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-inner">
                <Icon className="h-6 w-6" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{label}</p>
            <div className="flex items-baseline gap-4">
                <span className="text-4xl font-black text-gray-900 leading-none">{value}</span>
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-500/5 px-2 rounded-md">{trend}</span>
            </div>
        </div>
    );
}
