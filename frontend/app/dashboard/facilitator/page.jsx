"use client";

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import ContentManager from '@/components/admin/ContentManager';
import StudentDetailView from '@/components/facilitator/StudentDetailView';
import {
    Users, BookOpen, TrendingUp, Search, Filter, Download,
    Plus, ArrowRight, UserPlus, Settings, MoreVertical,
    Activity, Loader2
} from 'lucide-react';
import { clsx } from 'clsx';

export default function FacilitatorDashboard() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('All');
    const [activeView, setActiveView] = useState('students');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await fetch('/api/students');
                const data = await res.json();
                if (data.success) setStudents(data.students);
            } catch (err) {
                console.error('Failed to fetch students:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    // Derive real groups: use first word of email domain as group, fall back generic
    const groups = ['All', ...new Set(students.map(s => {
        const parts = s.email?.split('@')[1]?.split('.')[0];
        return parts ? parts.charAt(0).toUpperCase() + parts.slice(1) : 'General';
    }))];

    const filteredStudents = students.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const group = s.email?.split('@')[1]?.split('.')[0];
        const groupLabel = group ? group.charAt(0).toUpperCase() + group.slice(1) : 'General';
        const matchGroup = selectedGroup === 'All' || groupLabel === selectedGroup;
        return matchSearch && matchGroup;
    });

    // Compute real summary stats from fetched data
    const totalStudents = students.length;
    const avgAccuracy = students.length
        ? Math.round(students.reduce((sum, s) => sum + (s.score?.overallAccuracy || 0), 0) / students.length)
        : 0;
    const totalBooks = students.reduce((sum, s) => sum + (s.score?.totalSessions || 0), 0);

    if (selectedStudent) {
        return (
            <DashboardShell role="Facilitator">
                <StudentDetailView student={selectedStudent} onBack={() => setSelectedStudent(null)} />
            </DashboardShell>
        );
    }

    return (
        <DashboardShell role="Facilitator">
            <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-left duration-700">
                <div>
                    <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Facilitator Hub</h1>
                    <p className="text-xl text-gray-500 font-medium">Empower your students and monitor their growth in real-time.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex bg-white/40 backdrop-blur-md border border-white/40 p-1 rounded-full shadow-sm w-fit mr-4">
                        <button onClick={() => setActiveView('students')} className={clsx('px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all', activeView === 'students' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:text-black')}>Students</button>
                        <button onClick={() => setActiveView('content')} className={clsx('px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all', activeView === 'content' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:text-black')}>Content</button>
                    </div>
                    <button className="glass-pill px-8 py-4 text-gray-600 font-bold hover:bg-white/80 transition-all border-white/40 shadow-sm flex items-center">
                        <Download className="h-5 w-5 mr-3" /> <span>Reports</span>
                    </button>
                </div>
            </div>

            {activeView === 'content' ? (
                <ContentManager />
            ) : (
                <>
                    {/* Real Summary Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
                        <SummaryCard label="Total Students" value={totalStudents} icon={Users} trend={`${totalStudents} registered`} />
                        <SummaryCard label="Avg. Accuracy" value={`${avgAccuracy}%`} icon={TrendingUp} trend="Live from sessions" />
                        <SummaryCard label="Total Sessions" value={totalBooks} icon={BookOpen} trend="All time" />
                    </div>

                    {/* Student List */}
                    <div className="glass-panel rounded-[60px] border-white/40 shadow-2xl overflow-hidden">
                        <div className="p-10 border-b border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex items-center gap-10">
                                <h3 className="font-bold text-gray-900 text-2xl">Class Roster</h3>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {groups.slice(0, 5).map(group => (
                                        <button
                                            key={group}
                                            onClick={() => setSelectedGroup(group)}
                                            className={clsx(
                                                'px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border',
                                                selectedGroup === group
                                                    ? 'bg-black text-white border-black shadow-xl'
                                                    : 'bg-white/40 text-gray-400 border-white/40 hover:bg-white/60'
                                            )}
                                        >
                                            {group}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="glass-pill flex-1 flex items-center px-6 py-0 border-white/40">
                                    <Search className="h-4 w-4 text-gray-400 mr-3" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Quick search..."
                                        className="w-48 py-3 bg-transparent focus:outline-none font-semibold text-sm text-gray-700 placeholder:text-gray-400"
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
                            ) : filteredStudents.length === 0 ? (
                                <div className="text-center py-20">
                                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                    <p className="text-gray-400 font-bold text-lg">No students found.</p>
                                    <p className="text-gray-400 text-sm mt-1">Students will appear here once they register.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                        <tr>
                                            <th className="px-10 py-8">Student</th>
                                            <th className="px-10 py-8">Email</th>
                                            <th className="px-10 py-8">Accuracy</th>
                                            <th className="px-10 py-8">Sessions</th>
                                            <th className="px-10 py-8 text-right">Insights</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {filteredStudents.map(student => {
                                            const accuracy = student.score?.overallAccuracy ?? 0;
                                            const sessions = student.score?.totalSessions ?? 0;
                                            const lastActive = student.score?.lastSessionDate
                                                ? new Date(student.score.lastSessionDate).toLocaleDateString()
                                                : 'Never';
                                            return (
                                                <tr key={student._id} className="hover:bg-white/30 transition-all group">
                                                    <td className="px-10 py-7">
                                                        <div className="flex items-center">
                                                            <div className="h-14 w-14 rounded-2xl overflow-hidden mr-5 shadow-lg border border-white/40 bg-gray-100 flex items-center justify-center text-xl font-black text-gray-400">
                                                                {student.image
                                                                    ? <img src={student.image} className="w-full h-full object-cover" alt={student.name} />
                                                                    : <img src="/reading 3.jpeg" className="w-full h-full object-cover" alt={student.name} />
                                                                }
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-lg leading-tight group-hover:text-black">{student.name}</p>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Last active: {lastActive}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-7 text-sm text-gray-500 font-medium">{student.email}</td>
                                                    <td className="px-10 py-7">
                                                        <div className="flex items-center gap-6">
                                                            <span className={clsx('font-black text-lg min-w-[3rem]', accuracy > 80 ? 'text-green-600' : 'text-orange-500')}>
                                                                {accuracy}%
                                                            </span>
                                                            <div className="w-32 h-2.5 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-white/40 shadow-inner">
                                                                <div
                                                                    className={clsx('h-full rounded-full transition-all duration-[2s] shadow-lg', accuracy > 80 ? 'bg-black' : 'bg-orange-500')}
                                                                    style={{ width: `${accuracy}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-7 text-lg font-black text-gray-900">{sessions}</td>
                                                    <td className="px-10 py-7 text-right">
                                                        <button
                                                            onClick={() => setSelectedStudent({ ...student, accuracy: `${accuracy}%`, sessions })}
                                                            className="h-12 w-12 glass-panel rounded-2xl flex items-center justify-center text-gray-400 hover:text-black hover:bg-white transition-all ml-auto group border-white/40 shadow-sm"
                                                        >
                                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="p-10 border-t border-white/20 flex items-center justify-between">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                Showing {filteredStudents.length} of {students.length} students
                            </p>
                            <div className="flex items-center gap-4">
                                <button className="h-12 w-12 glass-panel rounded-2xl text-gray-400 hover:text-black transition-all border-white/40 shadow-sm flex items-center justify-center"><Settings className="h-4 w-4" /></button>
                                <button className="h-12 w-12 glass-panel rounded-2xl text-gray-400 hover:text-black transition-all border-white/40 shadow-sm flex items-center justify-center"><UserPlus className="h-4 w-4" /></button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DashboardShell>
    );
}

function SummaryCard({ label, value, icon: Icon, trend }) {
    return (
        <div className="glass-panel p-10 rounded-[60px] border-white/40 shadow-xl flex items-center group hover:bg-white transition-all cursor-default">
            <div className="h-20 w-20 bg-gray-100 text-gray-400 rounded-3xl flex items-center justify-center mr-8 group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-inner">
                <Icon className="h-10 w-10" />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{label}</p>
                <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-black text-gray-900 leading-none">{value}</span>
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-500/5 px-2 rounded-lg">{trend}</span>
                </div>
            </div>
        </div>
    );
}
