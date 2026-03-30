"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { UploadCloud, FileText, Video, Loader2, CheckCircle2, Image as ImageIcon, X } from 'lucide-react';
import { clsx } from 'clsx';

export default function ContentManager() {
    const [activeTab, setActiveTab] = useState('books');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Book Form State
    const [bookData, setBookData] = useState({ title: '', author: '', level: 'Beginner', fullText: '' });
    const [coverFile, setCoverFile] = useState(null);
    const [bookFile, setBookFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    // Drag states
    const [dragCover, setDragCover] = useState(false);
    const [dragBook, setDragBook] = useState(false);

    // Course Form State
    const [courseData, setCourseData] = useState({ title: '', description: '', videoUrl: '', level: 'Beginner', duration: '' });

    // Handle Image Preview
    useEffect(() => {
        if (!coverFile) {
            setCoverPreview(null);
            return;
        }
        // Don't create object URL if it's already an object URL from our canvas
        if (typeof coverFile === 'string') return;
        
        try {
            const objectUrl = URL.createObjectURL(coverFile);
            setCoverPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } catch (e) {
            console.error("Preview generation failed", e);
        }
    }, [coverFile]);

    const processPdfData = async (file) => {
        if (!file || file.type !== "application/pdf") return;
        
        try {
            // Dynamically import pdfjs-dist for Next.js Client
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            // 1. Generate Cover Thumbnail from Page 1
            if (!coverFile) {
                try {
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    await page.render({ canvasContext: context, viewport }).promise;
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const coverImageUrl = URL.createObjectURL(blob);
                            setCoverPreview(coverImageUrl); // Show immediate preview
                            const generatedCover = new File([blob], 'generated_cover.jpg', { type: 'image/jpeg' });
                            setCoverFile(generatedCover); // Queue for Supabase upload!
                        }
                    }, 'image/jpeg', 0.8);
                } catch (thumbErr) {
                    console.warn("Could not generate thumbnail", thumbErr);
                }
            }

            // 2. Extract Text silently
            try {
                let extractedText = "";
                const maxPages = Math.min(pdf.numPages, 100);
                for (let i = 1; i <= maxPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    extractedText += pageText + "\n\n";
                }
                setBookData(prev => ({ ...prev, fullText: extractedText.replace(/\n\s*\n/g, '\n\n').trim() }));
            } catch (textErr) {
                console.warn("Could not extract pdf text", textErr);
            }
        } catch (err) {
            console.warn("PDF auto-processing failed", err);
        }
    };

    const handleUploadToSupabase = async (file, path) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('content')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('content').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const simulateProgress = () => {
        setProgress(0);
        setErrorMsg('');
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 500);
        return interval;
    };

    const handleBookSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const progressInterval = simulateProgress();

        try {
            let coverUrl = '';
            let fileUrl = '';

            if (coverFile) {
                coverUrl = await handleUploadToSupabase(coverFile, 'covers');
            }
            if (bookFile) {
                fileUrl = await handleUploadToSupabase(bookFile, 'books');
            }

            const payload = { ...bookData, coverImage: coverUrl, fileUrl };
            const res = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const dbData = await res.json();
            if (!res.ok) throw new Error(dbData.error || 'Failed to save to database');
            
            setProgress(100);
            setSuccess(true);
            setBookData({ title: '', author: '', level: 'Beginner', fullText: '' });
            setCoverFile(null);
            setBookFile(null);
        } catch (error) {
            console.error("Full Upload Error:", error);
            setErrorMsg(error.message || "An unknown error occurred during upload.");
        } finally {
            clearInterval(progressInterval);
            setTimeout(() => {
                setLoading(false);
                setSuccess(false);
                setProgress(0);
            }, 3000);
        }
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const progressInterval = simulateProgress();

        try {
            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(courseData)
            });

            const dbData = await res.json();
            if (!res.ok) throw new Error(dbData.error || 'Failed to save course');

            setProgress(100);
            setSuccess(true);
            setCourseData({ title: '', description: '', videoUrl: '', level: 'Beginner', duration: '' });
        } catch (error) {
            console.error("Full Course Save Error:", error);
            setErrorMsg(error.message || "Failed to save course link.");
        } finally {
            clearInterval(progressInterval);
            setTimeout(() => {
                setLoading(false);
                setSuccess(false);
                setProgress(0);
            }, 3000);
        }
    };

    return (
        <div className="glass-panel p-10 rounded-[40px] border-white/40 shadow-xl max-w-4xl mx-auto w-full relative overflow-hidden">
            {/* Top Loading Progress Bar */}
            {loading && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100">
                    <div className="h-full bg-black transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                </div>
            )}

            <h2 className="text-3xl font-extrabold mb-8 text-gray-900 mt-2">Content Management</h2>
            
            <div className="flex space-x-4 mb-8">
                <button 
                    onClick={() => setActiveTab('books')}
                    className={clsx(
                        "flex items-center space-x-2 px-6 py-3 rounded-full font-bold transition-all border",
                        activeTab === 'books' ? "bg-black text-white border-black" : "bg-white/40 text-gray-500 border-white/40 hover:bg-white"
                    )}
                >
                    <FileText size={18} /> <span>Upload Book</span>
                </button>
                <button 
                    onClick={() => setActiveTab('courses')}
                    className={clsx(
                        "flex items-center space-x-2 px-6 py-3 rounded-full font-bold transition-all border",
                        activeTab === 'courses' ? "bg-black text-white border-black" : "bg-white/40 text-gray-500 border-white/40 hover:bg-white"
                    )}
                >
                    <Video size={18} /> <span>Add Course Link</span>
                </button>
            </div>

            {success && (
                <div className="mb-6 bg-green-50 animate-in fade-in slide-in-from-top-4 text-green-600 p-4 rounded-2xl flex items-center font-bold">
                    <CheckCircle2 className="mr-3" /> Successfully published to the platform!
                </div>
            )}

            {errorMsg && (
                <div className="mb-6 bg-red-50 animate-in fade-in slide-in-from-top-4 text-red-600 p-4 rounded-2xl flex items-center font-bold border border-red-100 shadow-sm relative pr-12">
                    <X className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="text-sm truncate" title={errorMsg}>{errorMsg}</span>
                    <button onClick={() => setErrorMsg('')} className="absolute right-4 text-red-400 hover:text-red-700 transition">
                        <X size={16} />
                    </button>
                </div>
            )}

            {activeTab === 'books' && (
                <form onSubmit={handleBookSubmit} className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Book Title</label>
                            <input required value={bookData.title} onChange={e => setBookData({...bookData, title: e.target.value})} className="w-full bg-white/60 border border-white/40 rounded-2xl p-4 focus:outline-none focus:border-gray-400 font-semibold" placeholder="e.g. The Brave Lion" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Author</label>
                            <input required value={bookData.author} onChange={e => setBookData({...bookData, author: e.target.value})} className="w-full bg-white/60 border border-white/40 rounded-2xl p-4 focus:outline-none focus:border-gray-400 font-semibold" placeholder="e.g. Alice Umutoni" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty Level</label>
                        <select value={bookData.level} onChange={e => setBookData({...bookData, level: e.target.value})} className="w-full bg-white/60 border border-white/40 rounded-2xl p-4 focus:outline-none focus:border-gray-400 font-semibold text-gray-700">
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cover Image Dropzone */}
                        <div 
                            onDragOver={(e) => { e.preventDefault(); setDragCover(true); }}
                            onDragLeave={() => setDragCover(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragCover(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    setCoverFile(e.dataTransfer.files[0]);
                                }
                            }}
                            className="relative"
                        >
                            <label className={clsx(
                                "border-2 border-dashed rounded-3xl p-8 text-center transition-colors cursor-pointer block h-full min-h-[16rem] flex flex-col justify-center",
                                dragCover ? "border-black bg-white/60" : "border-gray-300 bg-white/30 hover:bg-white/50",
                                coverPreview && "border-solid border-white/40 p-2 shadow-inner"
                            )}>
                                {coverPreview ? (
                                    <div className="relative h-full w-full rounded-2xl overflow-hidden group">
                                        <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover rounded-2xl" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                            <ImageIcon className="h-8 w-8 mb-2" />
                                            <span className="font-bold text-sm">Change Image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-sm font-bold text-gray-600 mb-2">Cover Image (Optional)</p>
                                        <p className="text-xs text-gray-400 font-medium">Click or Drop Image</p>
                                    </>
                                )}
                                <input type="file" accept="image/*" onChange={e => e.target.files[0] && setCoverFile(e.target.files[0])} className="hidden" />
                            </label>
                            {coverFile && (
                                <button type="button" onClick={() => setCoverFile(null)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors z-10">
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Book File Dropzone */}
                        <div 
                            onDragOver={(e) => { e.preventDefault(); setDragBook(true); }}
                            onDragLeave={() => setDragBook(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragBook(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    const file = e.dataTransfer.files[0];
                                    setBookFile(file);
                                    processPdfData(file);
                                }
                            }}
                            className="relative"
                        >
                            <label className={clsx(
                                "border-2 border-dashed rounded-3xl p-8 text-center transition-colors cursor-pointer block h-full min-h-[16rem] flex flex-col justify-center",
                                dragBook ? "border-black bg-white/60" : "border-gray-300 bg-white/30 hover:bg-white/50",
                                bookFile && "border-solid border-green-500 bg-green-50/50"
                            )}>
                                {bookFile ? (
                                    <div className="h-full flex flex-col items-center justify-center text-green-600 animate-in zoom-in-95">
                                        <CheckCircle2 className="mx-auto h-16 w-16 mb-4" />
                                        <p className="text-lg font-bold truncate px-4 w-full">{bookFile.name}</p>
                                        <p className="text-sm font-semibold opacity-70 mt-1">{(bookFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <>
                                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-sm font-bold text-gray-600 mb-2">Book File (PDF/EPUB) *</p>
                                        <p className="text-xs text-gray-400 font-medium">Click or Drop File</p>
                                    </>
                                )}
                                <input type="file" accept=".pdf,.epub" required={!bookFile} onChange={e => {
                                    if(e.target.files[0]) {
                                        const file = e.target.files[0];
                                        setBookFile(file);
                                        processPdfData(file);
                                    }
                                }} className="hidden" />
                            </label>
                            {bookFile && (
                                <button type="button" onClick={() => setBookFile(null)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors z-10">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-black text-white font-black py-5 rounded-2xl flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 transition-all shadow-xl relative overflow-hidden group">
                        <span className="relative z-10 flex items-center">
                            {loading ? <><Loader2 className="animate-spin h-5 w-5 mr-3" /> Uploading ({progress}%)...</> : "Publish Book"}
                        </span>
                        {/* Interactive hover fill */}
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-2xl" />
                    </button>
                </form>
            )}

            {activeTab === 'courses' && (
                <form onSubmit={handleCourseSubmit} className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
                            <input required value={courseData.title} onChange={e => setCourseData({...courseData, title: e.target.value})} className="w-full bg-white/60 border border-white/40 rounded-2xl p-4 focus:outline-none focus:border-gray-400 font-semibold" placeholder="e.g. Vowel Sounds" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty Level</label>
                            <select value={courseData.level} onChange={e => setCourseData({...courseData, level: e.target.value})} className="w-full bg-white/60 border border-white/40 rounded-2xl p-4 focus:outline-none focus:border-gray-400 font-semibold text-gray-700">
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">YouTube Video URL</label>
                        <input required value={courseData.videoUrl} onChange={e => setCourseData({...courseData, videoUrl: e.target.value})} type="url" className="w-full bg-white/60 border border-white/40 rounded-2xl p-4 focus:outline-none focus:border-gray-400 font-semibold" placeholder="https://youtube.com/watch?v=..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea required value={courseData.description} onChange={e => setCourseData({...courseData, description: e.target.value})} rows={3} className="w-full bg-white/60 border border-white/40 rounded-2xl p-4 focus:outline-none focus:border-gray-400 font-semibold" placeholder="Brief lesson description..." />
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-black text-white font-black py-5 rounded-2xl flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 transition-all shadow-xl relative overflow-hidden group">
                        <span className="relative z-10 flex items-center">
                            {loading ? <><Loader2 className="animate-spin h-5 w-5 mr-3" /> Publishing...</> : "Publish Course Link"}
                        </span>
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-2xl" />
                    </button>
                </form>
            )}
        </div>
    );
}
