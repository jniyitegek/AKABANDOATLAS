import React from 'react';
import {
    ArrowLeft,
    TrendingUp,
    AlertCircle,
    BookOpen,
    Calendar,
    FileText,
    User,
    MoreVertical
} from 'lucide-react';
import { clsx } from 'clsx';

export default function StudentDetailView({ student, onBack }) {
    if (!student) return null;

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center text-sm font-bold text-gray-500 hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg"><MoreVertical className="h-5 w-5 text-gray-400" /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile & Stats */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm text-center">
                        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl">
                            <User className="h-12 w-12 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                        <p className="text-sm text-gray-500 mb-6">Student ID: {student.id || "A-10293"}</p>

                        <div className="flex items-center justify-center space-x-2">
                            <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-tighter">Level 2</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-tighter">Active</span>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Key Performance</h3>
                        <div className="space-y-6">
                            <StatItem label="Avg Accuracy" value={student.accuracy || "0%"} color="text-green-600" />
                            <StatItem label="Read Frequency" value="High" color="text-blue-600" />
                            <StatItem label="Mistake Rate" value="12%" color="text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Middle/Right Column: Detailed History & Analysis */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Detailed Progress Chart Placeholder */}
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-gray-900 flex items-center">
                                <TrendingUp className="h-5 w-5 text-primary mr-2" /> Reading Accuracy Trend
                            </h3>
                            <span className="text-xs font-bold text-gray-400">Last 30 Days</span>
                        </div>
                        <div className="h-48 flex items-end justify-between space-x-3 px-2">
                            {[60, 65, 58, 72, 85, 87, 82, 90, 88].map((v, i) => (
                                <div key={i} className="flex-1 bg-gray-50 rounded-lg relative group">
                                    <div
                                        className="absolute bottom-0 w-full bg-primary/40 rounded-lg transition-all duration-1000"
                                        style={{ height: `${v}%` }}
                                    />
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded">
                                        {v}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reading Sessions History */}
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center">
                                <Calendar className="h-5 w-5 text-gray-400 mr-2" /> Session History
                            </h3>
                            <button className="text-xs font-bold text-primary hover:underline flex items-center">
                                <FileText className="h-4 w-4 mr-1" /> Export CSV
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                    <tr>
                                        <th className="px-8 py-4">Date</th>
                                        <th className="px-8 py-4">Book Title</th>
                                        <th className="px-8 py-4">Score</th>
                                        <th className="px-8 py-4">Mistakes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <SessionRow date="Mar 10" book="The Brave Lion" score="87%" mistakes="2" />
                                    <SessionRow date="Mar 09" book="Morning Sun" score="92%" mistakes="1" />
                                    <SessionRow date="Mar 07" book="Akabando's Secret" score="64%" mistakes="6" warning />
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mistake Pattern Analysis */}
                    <div className="bg-orange-50/50 p-8 rounded-[40px] border border-orange-100/50">
                        <h3 className="font-bold text-gray-900 flex items-center mb-6">
                            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" /> Improvement Areas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <MistakeCard label="Vowel Pronunciation" freq="Common" desc="Struggles with 'u' vs 'o' sounds in longer words." />
                            <MistakeCard label="Pacing" freq="Frequent" desc="Reads very quickly, leading to skipped small words." />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatItem({ label, value, color }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{label}</span>
            <span className={clsx("font-bold text-lg", color)}>{value}</span>
        </div>
    );
}

function SessionRow({ date, book, score, mistakes, warning }) {
    return (
        <tr className="hover:bg-gray-50/50 transition-colors">
            <td className="px-8 py-5 text-sm font-medium text-gray-500">{date}</td>
            <td className="px-8 py-5 font-bold text-gray-900">{book}</td>
            <td className="px-8 py-5 text-sm">
                <span className={clsx("font-extrabold", warning ? "text-orange-500" : "text-green-600")}>{score}</span>
            </td>
            <td className="px-8 py-5 text-sm text-gray-500">{mistakes} detected</td>
        </tr>
    );
}

function MistakeCard({ label, freq, desc }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-orange-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900 text-sm">{label}</h4>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{freq}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
        </div>
    );
}
