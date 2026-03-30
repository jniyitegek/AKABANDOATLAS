import React, { useState, useEffect } from 'react';
import { X, Mic, CheckCircle2, Star, ArrowRight, ArrowLeft, RefreshCw, Trophy } from 'lucide-react';
import useSpeechAnalyzer from '@/hooks/useSpeechAnalyzer';
import { clsx } from 'clsx';
import { useSession } from 'next-auth/react';

export default function BookSimulator({ book, onClose }) {
    const { data: session } = useSession();
    
    // Parse the book text into paragraphs
    const paragraphs = book?.fullText ? book.fullText.split('\n').filter(p => p.trim() !== '') : [];
        
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [accumulatedScore, setAccumulatedScore] = useState(0); 

    const currentText = paragraphs[currentIndex] || "";

    const {
        isRecording,
        results,
        timeLeft,
        liveWordResults,
        startRecording,
        stopRecording,
        analyze,
        setTranscript,
        setResults,
        setElapsedTime,
        elapsedTime
    } = useSpeechAnalyzer(currentText);

    // Save session telemetry purely for metrics
    useEffect(() => {
        if (results && session?.user?.id) {
            fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: session.user.id,
                    bookId: book._id || "library_practice",
                    originalText: results.originalText,
                    transcribedText: results.spokenText,
                    accuracy: results.accuracy,
                    fluencyScore: 100, 
                    duration: results.duration || 0,
                    mistakes: results.wordResults.filter(w => w.status !== 'correct').map((w, i) => ({
                        word: w.word,
                        type: w.status === 'skipped' ? 'Omission' : 'Mispronunciation',
                        position: i
                    }))
                })
            }).catch(e => console.error("Session telemetry failed:", e));
        }
    }, [results, session, book]);

    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
            analyze();
        } else {
            setTranscript("");
            setResults(null);
            setElapsedTime(0);
            startRecording();
        }
    };

    const handleNextParagraph = () => {
        if (results) {
            setAccumulatedScore(prev => prev + results.accuracy);
        }

        setResults(null);
        setTranscript("");
        
        if (currentIndex < paragraphs.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handleRetry = () => {
        setResults(null);
        setTranscript("");
    };

    if (!book || paragraphs.length === 0) return null;

    if (isFinished) {
        const finalAverage = Math.round(accumulatedScore / paragraphs.length);
        
        return (
            <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center animate-in fade-in duration-500">
                <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="h-8 w-8 text-gray-400" />
                </button>
                
                <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-700">
                    <div className="h-32 w-32 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
                        <Trophy size={64} fill="currentColor" />
                    </div>
                    
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Book Completed!</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest">{book.title}</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Average Accuracy</p>
                        <h2 className="text-6xl font-black text-black">{finalAverage}%</h2>
                        <div className="flex justify-center mt-4 text-yellow-500 space-x-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={28} fill={i < Math.round(finalAverage/20) ? "currentColor" : "none"} className={i < Math.round(finalAverage/20) ? "" : "text-gray-300"} />
                            ))}
                        </div>
                    </div>

                    <button onClick={onClose} className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg hover:bg-gray-800 transition-colors shadow-2xl hover:-translate-y-1">
                        Return to Library
                    </button>
                </div>
            </div>
        );
    }

    const progressPercent = ((currentIndex) / paragraphs.length) * 100;

    return (
        <div className="fixed inset-0 z-[200] bg-gray-50 flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Top Bar */}
            <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
                <div className="flex items-center space-x-6">
                    <img src={book.coverImage || '/reading 2.avif'} className="h-12 w-12 rounded-lg object-cover shadow-sm border" alt="cover" />
                    <div>
                        <h2 className="font-black text-xl text-gray-900 line-clamp-1">{book.title}</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Paragraph {currentIndex + 1} of {paragraphs.length}</p>
                    </div>
                </div>

                <div className="flex-1 max-w-sm mx-10 hidden md:block">
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>

                <button onClick={onClose} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <X className="h-6 w-6 text-gray-500 hover:text-black" />
                </button>
            </div>

            {/* Main Interactive Stage */}
            <div className="flex-1 overflow-y-auto px-6 py-12 flex items-center justify-center relative">
                
                <div className="max-w-4xl w-full">
                    <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-12 md:p-20 relative overflow-hidden">
                        
                        {/* Background Decoration */}
                        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-green-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-bold leading-relaxed text-gray-800 flex flex-wrap gap-x-3 gap-y-4">
                                {liveWordResults.map((wr, i) => (
                                    <span key={i} className={clsx(
                                        "transition-all duration-300 rounded-xl px-1",
                                        wr.status === 'correct' ? "text-green-500 font-black" : 
                                        wr.status === 'skipped' ? "text-red-500 opacity-50 line-through" : 
                                        wr.status === 'current' ? "bg-black text-white shadow-xl scale-110 -translate-y-1" :
                                        "text-gray-800"
                                    )}>
                                        {wr.word}
                                    </span>
                                ))}
                            </h2>
                        </div>
                    </div>

                    {/* Controls & Results */}
                    <div className="mt-12 flex flex-col items-center">
                        {!results ? (
                            <div className="flex flex-col items-center animate-in slide-in-from-bottom-4">
                                {isRecording && (
                                    <div className="mb-6 flex space-x-2">
                                        {[2, 4, 3, 5, 4, 6, 4, 3, 5, 2, 4, 3].map((h, i) => (
                                            <div
                                                key={i}
                                                className="w-1.5 bg-green-500 rounded-full transition-all duration-150"
                                                style={{ height: `${h * 6}px`, animation: `pulse 1s infinite ${i * 0.1}s` }}
                                            />
                                        ))}
                                    </div>
                                )}
                                <button
                                    onClick={handleToggleRecording}
                                    className={clsx(
                                        "h-24 w-24 !rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border-4",
                                        isRecording ? "bg-red-500 text-white border-red-200 shadow-red-500/30 scale-110" : "bg-black text-white border-gray-200 hover:scale-105"
                                    )}
                                >
                                    {isRecording ? <div className="h-6 w-6 bg-white rounded-sm" /> : <Mic size={36} />}
                                </button>
                                <p className="mt-6 text-sm font-bold text-gray-500 uppercase tracking-widest">
                                    {isRecording ? `Recording... (${timeLeft}s)` : "Press Mic to Read Paragraph"}
                                </p>
                            </div>
                        ) : (
                            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border border-gray-100 flex items-center justify-between animate-in slide-in-from-bottom-8 duration-500">
                                <div className="flex items-center space-x-6">
                                    <div className="h-20 w-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Paragraph Score</p>
                                        <div className="flex items-end space-x-3">
                                            <h3 className="text-4xl font-black">{results.accuracy}%</h3>
                                            <div className="flex space-x-1 pb-1.5 text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={16} fill={i < Math.round(results.accuracy/20) ? "currentColor" : "none"} className={i < Math.round(results.accuracy/20) ? "" : "text-gray-300"} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-3">
                                    <button 
                                        onClick={handleNextParagraph}
                                        className="bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg"
                                    >
                                        {currentIndex < paragraphs.length - 1 ? "Next Paragraph" : "Finish Book"} <ArrowRight size={18} className="ml-2" />
                                    </button>
                                    <button 
                                        onClick={handleRetry}
                                        className="bg-white text-gray-600 px-8 py-3 rounded-2xl font-bold flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        <RefreshCw size={14} className="mr-2" /> Retry Section
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
