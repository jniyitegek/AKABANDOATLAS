"use client";

import Link from 'next/link';
import { Home, BookOpen, Search, Compass, AlertCircle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-black/5 rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-black/5 rounded-full pointer-events-none" />
            
            <div className="max-w-2xl w-full relative z-10 text-center space-y-12">
                {/* 404 Label */}
                <div className="relative inline-block">
                    <h1 className="text-[180px] font-black leading-none tracking-tighter text-black/5 select-none hover:text-black/10 transition-colors duration-1000">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="glass-panel p-8 rounded-[40px] border-white/60 shadow-3xl transform hover:-rotate-1 transition-transform">
                            <AlertCircle size={48} className="text-black" />
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-6">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Oops! This page took a wrong turn.</h2>
                    <p className="text-lg text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
                        But great things are just one click away. Head back home and keep exploring!
                    </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                    <Link 
                        href="/"
                        className="w-full sm:w-auto px-10 py-5 bg-black text-white font-black rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-3"
                    >
                        <Home size={20} />
                        <span className="uppercase tracking-widest text-xs">Back to Home</span>
                    </Link>
                    
                    <Link 
                        href="/simulator"
                        className="w-full sm:w-auto px-10 py-5 glass-panel bg-white/40 hover:bg-white text-gray-900 font-black rounded-3xl shadow-xl border-white/60 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-3"
                    >
                        <BookOpen size={20} />
                        <span className="uppercase tracking-widest text-xs">Reading Master</span>
                    </Link>
                </div>

                {/* Footer Quote */}
                <p className="pt-20 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] opacity-40">
                    "Not all who wander are lost, but they often find 404 pages."
                </p>
            </div>
        </div>
    );
}
