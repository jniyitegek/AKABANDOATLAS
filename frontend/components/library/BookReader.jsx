import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Square, Volume2, BookOpen } from 'lucide-react';

export default function BookReader({ book, onClose }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [rate, setRate] = useState(1);
    
    // Clean up TTS when modal closes
    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const togglePlay = () => {
        if (!book.fullText || !('speechSynthesis' in window)) return;

        if (isPlaying && !isPaused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        } else if (isPlaying && isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        } else {
            // Cancel any existing just in case
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(book.fullText);
            utterance.rate = rate;
            // Attempt to use Kinyarwanda if supported by OS, otherwise defaults to OS primary
            utterance.lang = 'rw-RW'; 
            
            utterance.onend = () => {
                setIsPlaying(false);
                setIsPaused(false);
            };

            utterance.onerror = (e) => {
                console.error("Speech synthesis error", e);
                setIsPlaying(false);
                setIsPaused(false);
            };

            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
            setIsPaused(false);
        }
    };

    const stopAudio = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
        setIsPaused(false);
    };

    const handleRateChange = (newRate) => {
        setRate(newRate);
        if (isPlaying) {
            // To change rate cleanly mid-speech, Web Speech usually needs a restart 
            // We just cancel it, user can hit play again to start over at new speed
            stopAudio();
        }
    };

    if (!book) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-gray-900 flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Top Navigation / Audio Bar */}
            <div className="h-20 bg-white flex items-center justify-between px-8 shadow-md z-10 shrink-0 border-b border-gray-200">
                <div className="flex items-center space-x-6">
                    <img 
                        src={book.coverImage || '/reading 2.avif'} 
                        className="h-12 w-12 rounded-lg object-cover shadow-sm border"
                        alt="cover thumb"
                    />
                    <div>
                        <h2 className="font-black text-xl text-gray-900 leading-tight">{book.title}</h2>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{book.author}</span>
                    </div>
                </div>

                <div className="flex items-center space-x-8">
                    {/* TTS Audiobook Player */}
                    {book.fullText && (
                        <div className="flex items-center bg-gray-50 rounded-full p-2 pr-6 border border-gray-200 shadow-inner space-x-4">
                            <div className="bg-white rounded-full p-2 shadow-sm border border-gray-100 flex items-center justify-center">
                                <Volume2 className="h-5 w-5 text-gray-600" />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={togglePlay} 
                                    className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 hover:bg-gray-800 transition-all shadow-md"
                                >
                                    {isPlaying && !isPaused ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-1" fill="currentColor" />}
                                </button>
                                
                                {(isPlaying || isPaused) && (
                                    <button 
                                        onClick={stopAudio} 
                                        className="h-10 w-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors border border-red-100"
                                    >
                                        <Square size={14} fill="currentColor" />
                                    </button>
                                )}
                            </div>

                            <div className="h-6 w-[1px] bg-gray-300 mx-2"></div>

                            <select 
                                value={rate} 
                                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                                className="bg-transparent text-sm font-bold text-gray-600 outline-none cursor-pointer hover:text-black transition-colors"
                            >
                                <option value="0.5">0.5x Speed</option>
                                <option value="0.75">0.75x Speed</option>
                                <option value="1">1x Normal</option>
                                <option value="1.25">1.25x Speed</option>
                            </select>
                        </div>
                    )}

                    <button onClick={onClose} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors group">
                        <X className="h-6 w-6 text-gray-500 group-hover:text-black" />
                    </button>
                </div>
            </div>

            {/* Document / PDF Engine */}
            <div className="flex-1 bg-gray-100 relative">
                {book.fileUrl ? (
                    <iframe 
                        src={book.fileUrl} 
                        className="w-full h-full border-none"
                        title={book.title}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-12">
                        <BookOpen className="h-24 w-24 mb-6 opacity-20" />
                        <h2 className="text-2xl font-bold text-gray-600 mb-2">No Document File Provided</h2>
                        <p className="text-sm font-medium px-4 text-center max-w-md">The facilitator only provided the raw text for this book. You can read it below or listen to the AI Audiobook above.</p>
                        
                        {book.fullText && (
                            <div className="mt-8 max-w-3xl w-full bg-white p-12 rounded-[40px] shadow-xl border border-gray-200/60 text-gray-800 font-semibold leading-relaxed h-[50vh] overflow-y-auto text-lg space-y-4">
                                {book.fullText.split('\n').filter(p => p.trim() !== '').map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
