import React from 'react';
import { Play, BookOpen, X, Mic, Info } from 'lucide-react';
import { clsx } from 'clsx';

export default function BookModal({ book, onClose, onRead, onPractice }) {
    if (!book) return null;

    const hasText = !!book.fullText;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-8 relative flex flex-col md:flex-row shadow-2xl border border-white/40">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors z-10">
                    <X className="h-6 w-6" />
                </button>

                <div className="w-full md:w-1/3 md:mr-8 mb-6 md:mb-0 relative">
                    <img 
                        src={book.coverImage || '/reading 2.avif'} 
                        className="w-full rounded-2xl shadow-xl aspect-[3/4] object-cover border border-gray-100" 
                        alt="cover" 
                    />
                </div>
                
                <div className="w-full md:w-2/3 flex flex-col justify-center">
                    <div className="active-pill w-max px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-4 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                        {book.level}
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 leading-tight mb-2">{book.title}</h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">{book.author}</p>
                    
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-8">
                        <p className="text-gray-600 font-medium text-sm leading-relaxed">
                            {book.description || "Dive into this exciting story to master your Kinyarwanda reading skills. You can read the book normally, or use our AI to practice your pronunciation in real-time."}
                        </p>
                    </div>

                    {!hasText && (
                        <div className="mb-4 flex items-start text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                            <Info className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                            <p className="text-xs font-semibold">This book does not have AI-readable text configured. Practice Mode and Text-to-Speech audio will be unavailable.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                        <button 
                            onClick={() => onRead(book)} 
                            className="bg-black text-white rounded-2xl py-5 px-4 flex items-center justify-center font-bold hover:scale-105 hover:bg-gray-900 transition-all shadow-xl group border border-black/10"
                        >
                            <BookOpen className="h-5 w-5 mr-3 opacity-70 group-hover:opacity-100 transition-opacity" /> Read Book
                        </button>
                        
                        <button 
                            onClick={() => onPractice(book)} 
                            disabled={!hasText}
                            className={clsx(
                                "rounded-2xl py-5 px-4 flex items-center justify-center font-bold transition-all shadow-xl group border",
                                hasText 
                                    ? "bg-green-500 text-white hover:scale-105 hover:bg-green-600 border-green-600" 
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 shadow-none border"
                            )}
                        >
                            <Mic className="h-5 w-5 mr-3 opacity-70 group-hover:opacity-100 transition-opacity" /> Practice Reading
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
