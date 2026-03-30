"use client";

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { useSession } from 'next-auth/react';
import { 
    User, Lock, Shield, Plus, Trash2, Search, 
    Save, Key, UserPlus, Loader2, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const [activeTab, setActiveTab] = useState('profile');
    
    // Profile State
    const [name, setName] = useState(session?.user?.name || '');
    const [email, setEmail] = useState(session?.user?.email || '');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Password State
    const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Admin State: User Management
    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Student' });

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name);
            setEmail(session.user.email);
        }
    }, [session]);

    useEffect(() => {
        if (activeTab === 'admin' && session?.user?.role === 'Admin') {
            fetchUsers();
        }
    }, [activeTab, session]);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.success) setUsers(data.users);
        } catch (err) {
            toast.error("Failed to load users");
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            const res = await fetch(`/api/users/${session.user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Profile updated successfully");
                await update({ name, email });
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.next !== passwords.confirm) {
            return toast.error("New passwords do not match");
        }
        setIsUpdatingPassword(true);
        try {
            const res = await fetch(`/api/users/${session.user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    currentPassword: passwords.current, 
                    newPassword: passwords.next 
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Password updated successfully");
                setPasswords({ current: '', next: '', confirm: '' });
            } else {
                toast.error(data.message || "Update failed");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            const data = await res.json();
            if (data.success) {
                toast.success("User added successfully");
                setShowAddModal(false);
                setNewUser({ name: '', email: '', password: '', role: 'Student' });
                fetchUsers();
            } else {
                toast.error(data.message || "Failed to add user");
            }
        } catch (err) {
            toast.error("An error occurred");
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success("User deleted");
                fetchUsers();
            }
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const isAdmin = session?.user?.role === 'Admin';

    return (
        <DashboardShell>
            <div className="mb-10 animate-in fade-in slide-in-from-left duration-700">
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">Settings</h1>
                <p className="text-xl text-gray-500 font-medium">Manage your profile and platform preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    <TabButton 
                        active={activeTab === 'profile'} 
                        onClick={() => setActiveTab('profile')} 
                        icon={User} 
                        label="Profile" 
                    />
                    <TabButton 
                        active={activeTab === 'security'} 
                        onClick={() => setActiveTab('security')} 
                        icon={Lock} 
                        label="Security" 
                    />
                    {isAdmin && (
                        <TabButton 
                            active={activeTab === 'admin'} 
                            onClick={() => setActiveTab('admin')} 
                            icon={Shield} 
                            label="Admin Control" 
                        />
                    )}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Profile Panel */}
                    {activeTab === 'profile' && (
                        <div className="glass-panel p-10 rounded-[40px] border-white/60 shadow-xl animate-in fade-in slide-in-from-right duration-500">
                            <h3 className="text-2xl font-bold mb-8 flex items-center">
                                <User className="mr-4 text-gray-400" /> Public Profile
                            </h3>
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="Full Name" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        placeholder="Your name"
                                    />
                                    <Input 
                                        label="Email Address" 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)} 
                                        placeholder="your@email.com"
                                        type="email"
                                    />
                                </div>
                                <button 
                                    disabled={isUpdatingProfile}
                                    className="btn-primary flex items-center space-x-2"
                                >
                                    {isUpdatingProfile ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={18} />}
                                    <span>Save Changes</span>
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Security Panel */}
                    {activeTab === 'security' && (
                        <div className="glass-panel p-10 rounded-[40px] border-white/60 shadow-xl animate-in fade-in slide-in-from-right duration-500">
                            <h3 className="text-2xl font-bold mb-8 flex items-center">
                                <Key className="mr-4 text-gray-400" /> Change Password
                            </h3>
                            <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-6">
                                <Input 
                                    label="Current Password" 
                                    type="password"
                                    value={passwords.current} 
                                    onChange={e => setPasswords({...passwords, current: e.target.value})} 
                                />
                                <div className="h-[1px] bg-gray-100 my-4" />
                                <Input 
                                    label="New Password" 
                                    type="password"
                                    value={passwords.next} 
                                    onChange={e => setPasswords({...passwords, next: e.target.value})} 
                                />
                                <Input 
                                    label="Confirm New Password" 
                                    type="password"
                                    value={passwords.confirm} 
                                    onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                                />
                                <button 
                                    disabled={isUpdatingPassword}
                                    className="btn-primary flex items-center space-x-2"
                                >
                                    {isUpdatingPassword ? <Loader2 className="animate-spin h-4 w-4" /> : <Lock size={18} />}
                                    <span>Update Password</span>
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Admin Panel */}
                    {activeTab === 'admin' && isAdmin && (
                        <div className="glass-panel p-10 rounded-[40px] border-white/60 shadow-xl animate-in fade-in slide-in-from-right duration-500">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-bold flex items-center">
                                    <Shield className="mr-4 text-gray-400" /> User Management
                                </h3>
                                <button 
                                    onClick={() => setShowAddModal(true)}
                                    className="px-6 py-3 bg-black text-white rounded-2xl font-bold flex items-center space-x-2 hover:scale-105 transition-transform shadow-xl"
                                >
                                    <UserPlus size={18} />
                                    <span>Add User</span>
                                </button>
                            </div>

                            <div className="relative mb-6">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-medium"
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            <th className="pb-6 px-4">User</th>
                                            <th className="pb-6 px-4">Role</th>
                                            <th className="pb-6 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {isLoadingUsers ? (
                                            <tr>
                                                <td colSpan="3" className="py-10 text-center text-gray-400 font-bold">Loading users...</td>
                                            </tr>
                                        ) : users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                                            <tr key={user._id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="py-5 px-4 font-bold text-gray-900">
                                                    <div>{user.name}</div>
                                                    <div className="text-[10px] text-gray-400 tracking-widest font-bold uppercase">{user.email}</div>
                                                </td>
                                                <td className="py-5 px-4">
                                                    <span className={clsx(
                                                        "px-3 py-1 text-[10px] font-black uppercase rounded-full border",
                                                        user.role === 'Admin' ? "bg-black text-white border-black" : "bg-gray-100 text-gray-600 border-gray-200"
                                                    )}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-4 text-right">
                                                    <button 
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] max-w-lg w-full p-10 shadow-3xl border border-white/40 animate-in zoom-in-95 duration-500">
                        <h3 className="text-3xl font-extrabold mb-8 flex items-center">
                            <UserPlus className="mr-4" /> Manual Enrollment
                        </h3>
                        <form onSubmit={handleAddUser} className="space-y-6">
                            <Input label="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Jane Doe" />
                            <Input label="Email Address" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="jane@akabando.com" />
                            <Input label="Initial Password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                            
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Access Role</label>
                                <select 
                                    value={newUser.role}
                                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-bold text-sm"
                                >
                                    <option value="Student">Student</option>
                                    <option value="Facilitator">Facilitator</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-4 mt-10">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-black text-white rounded-2xl font-bold shadow-xl hover:scale-[1.02] transition-transform">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardShell>
    );
}

function TabButton({ active, onClick, icon: Icon, label }) {
    return (
        <button 
            onClick={onClick}
            className={clsx(
                "w-full flex items-center space-x-4 p-5 rounded-2xl transition-all duration-300 font-bold text-sm",
                active 
                    ? "bg-black text-white shadow-xl scale-105 translate-x-2" 
                    : "text-gray-400 hover:text-black hover:bg-white/60"
            )}
        >
            <Icon size={20} />
            <span>{label}</span>
        </button>
    );
}

function Input({ label, ...props }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <input 
                {...props}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-300"
            />
        </div>
    );
}
