"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import { Search, Filter, BookOpen, Play, Bookmark, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import BookModal from '@/components/library/BookModal';
import BookReader from '@/components/library/BookReader';
import BookSimulator from '@/components/library/BookSimulator';

function LibraryContent() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get('search') || "";
    
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [filterLevel, setFilterLevel] = useState("All");
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Update search query if URL params change
    useEffect(() => {
        const s = searchParams.get('search');
        if (s !== null) setSearchQuery(s);
    }, [searchParams]);

    // Advanced Reading Engine states
    const [selectedBook, setSelectedBook] = useState(null);
    const [activeView, setActiveView] = useState('library'); // 'library', 'modal', 'read', 'practice'

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await fetch('/api/books');
                const data = await res.json();
                if (data.success && data.books.length > 0) {
                    setBooks(data.books);
                }
            } catch (error) {
                console.error("Failed fetching live books", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = filterLevel === "All" || book.level === filterLevel;
        return matchesSearch && matchesLevel;
    });

    const cycleFilter = () => {
        const levels = ["All", "Beginner", "Intermediate", "Advanced"];
        const currentIndex = levels.indexOf(filterLevel);
        setFilterLevel(levels[(currentIndex + 1) % levels.length]);
    };

    return (
        <DashboardShell role="Student">
            <div className="mb-12 animate-in fade-in slide-in-from-left duration-700">
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Open Library</h1>
                <p className="text-xl text-gray-500 font-medium">Explore Afro-centric stories and tales.</p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                <div className="flex-1 glass-pill flex items-center px-6 py-1 border-white/40 shadow-sm">
                    <Search className="h-5 w-5 text-gray-400 mr-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for books, authors..."
                        className="w-full py-4 bg-transparent focus:outline-none font-semibold text-gray-700 placeholder:text-gray-400"
                    />
                </div>
                <button 
                    onClick={cycleFilter}
                    className="glass-pill flex items-center space-x-3 px-8 py-4 text-gray-600 font-bold hover:bg-white/80 transition-all border-white/40 shadow-sm"
                >
                    <Filter className="h-5 w-5" /> <span>Level: {filterLevel}</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 flex flex-col items-center">
                    <Loader2 className="animate-spin h-10 w-10 text-gray-400 mb-4" />
                    <p className="text-gray-500 font-bold text-xl">Loading library archive...</p>
                </div>
            ) : filteredBooks.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 font-bold text-xl">No books found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                    {filteredBooks.map((book) => (
                        <div key={book._id || book.id} className="group cursor-pointer" onClick={() => { setSelectedBook(book); setActiveView('modal'); }}>
                            <div className="relative aspect-[3/4] rounded-5xl overflow-hidden glass-panel border-white/40 shadow-xl group-hover:shadow-2xl group-hover:-translate-y-3 transition-all duration-700">
                                <img
                                    src={book.coverImage || book.img || '/reading 2.avif'}
                                    alt={book.title}
                                    className="absolute inset-0 h-full w-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 text-white font-bold backdrop-blur-sm bg-black/20">
                                <span className="bg-white text-black font-bold px-8 py-3 rounded-2xl flex items-center shadow-2xl hover:scale-105 transition-transform">
                                    <BookOpen size={16} className="mr-2" /> Open
                                </span>
                            </div>

                            <button className="absolute top-6 right-6 p-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-all">
                                <Bookmark size={18} />
                            </button>

                            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                <div className="active-pill px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em]">
                                    {book.level}
                                </div>
                                <div className="flex items-center text-white space-x-1">
                                    <Star size={12} fill="currentColor" className="text-yellow-400" />
                                    <span className="text-[10px] font-bold">4.8</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 px-2">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-black transition-colors line-clamp-1 leading-tight">{book.title}</h3>
                            <p className="text-sm font-semibold text-gray-400 mt-1 uppercase tracking-widest text-[10px]">{book.author}</p>
                        </div>
                    </div>
                ))}
            </div>
            )}

            {/* Dynamic Interactive Engine Overlays */}
            {activeView === 'modal' && (
                <BookModal 
                    book={selectedBook} 
                    onClose={() => { setSelectedBook(null); setActiveView('library'); }}
                    onRead={() => setActiveView('read')}
                    onPractice={() => setActiveView('practice')}
                />
            )}

            {activeView === 'read' && (
                <BookReader 
                    book={selectedBook} 
                    onClose={() => setActiveView('library')} 
                />
            )}

            {activeView === 'practice' && (
                <BookSimulator book={selectedBook} onClose={() => setActiveView('library')} />
            )}
        </DashboardShell>
    );
}

export default function LibraryPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-bold text-gray-400 animate-pulse">Loading Library Library...</div>}>
            <LibraryContent />
        </Suspense>
    );
}
