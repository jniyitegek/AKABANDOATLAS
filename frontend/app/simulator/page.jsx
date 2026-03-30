"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardShell from '@/components/layout/DashboardShell';
import {
    Mic2, Play, AlertCircle, RefreshCcw, CheckCircle2,
    Star, ArrowRight, Video, Headphones, Mic, XCircle,
    Maximize2, Send, Paperclip, ImageIcon, Music, VideoIcon,
    Smile, CornerDownRight, User, MicOff, VideoOff, VolumeX,
    Plus, Loader2
} from 'lucide-react';
import useSpeechAnalyzer from '@/hooks/useSpeechAnalyzer';
import { io } from 'socket.io-client';
import { clsx } from 'clsx';
import { useRef } from 'react';
import { toast } from 'sonner';

const SAMPLE_SENTENCES = [
    "The quick brown fox jumps over the lazy dog.",
    "Reading books helps me learn new things about the world.",
    "I want to become a great leader and help my community.",
    "Knowledge is power and education is the key to success.",
];

function SimulatorContent() {
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const router = useRouter();
    const urlText = searchParams.get('text');
    const urlTitle = searchParams.get('title');

    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [trainingWord, setTrainingWord] = useState(null);

    // Database Content State
    const [dbSentences, setDbSentences] = useState([]);
    const [isSentencesLoading, setIsSentencesLoading] = useState(true);
    const [showAddSentence, setShowAddSentence] = useState(false);
    const [newSentenceText, setNewSentenceText] = useState("");
    const [newSentenceDifficulty, setNewSentenceDifficulty] = useState("Medium");

    // Device States
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);

    const allSentences = dbSentences.length > 0
        ? dbSentences.map(s => s.text)
        : SAMPLE_SENTENCES;

    const baseText = urlText || allSentences[Math.min(currentSentenceIndex, allSentences.length - 1)];
    const targetText = trainingWord || baseText;

    const {
        isRecording,
        transcript,
        results,
        timeLeft,
        elapsedTime,
        liveWordResults,
        startRecording,
        stopRecording,
        analyze,
        setTranscript,
        setResults,
        setElapsedTime
    } = useSpeechAnalyzer(targetText);

    // Socket & Chat State
    const [socket, setSocket] = useState(null);
    const [liveMessages, setLiveMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [directoryUsers, setDirectoryUsers] = useState([]);
    const [currentChatInput, setCurrentChatInput] = useState("");
    const [isChatFullscreen, setIsChatFullscreen] = useState(false);
    const [activeChat, setActiveChat] = useState({ type: 'global', name: 'World Room' });
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [liveMessages]);

    useEffect(() => {
        // Fetch User Directory
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                if (data.success) setDirectoryUsers(data.users || []);
            })
            .catch(e => console.error("Error fetching users:", e));

        // Fetch Sentences
        fetch('/api/sentences')
            .then(res => res.json())
            .then(data => {
                if (data.success) setDbSentences(data.sentences);
                setIsSentencesLoading(false);
            })
            .catch(e => {
                console.error("Error fetching sentences:", e);
                setIsSentencesLoading(false);
            });

        if (!session?.user?.id) return;

        // Connect Socket
        const newSocket = io('http://127.0.0.1:4000');
        setSocket(newSocket);

        newSocket.emit('join_room', {
            userId: session.user.id,
            username: session.user.name,
            room: 'global'
        });

        // Listeners - Savely append all incoming traffic
        newSocket.on('connect', () => console.log("🔌 Socket connected to backend on 4000"));
        newSocket.on('connect_error', (err) => console.error("❌ Socket connection error:", err));

        newSocket.on('receive_message', (msg) => {
            console.log("☁️ Global message received:", msg);
            setLiveMessages(prev => [...prev, msg]);
        });

        newSocket.on('receive_dm', (msg) => {
            console.log("🔒 Private DM received:", msg);
            setLiveMessages(prev => [...prev, msg]);
        });

        newSocket.on('online_users', (users) => {
            console.log("👥 Online users updated:", users.length);
            setOnlineUsers(users);
        });

        newSocket.on('message_history', (history) => {
            setLiveMessages(history);
        });

        return () => newSocket.close();
    }, [session?.user?.id]); // Only reconnect if user session changes

    const sendMessage = () => {
        console.log("📤 sendMessage triggered", {
            input: currentChatInput,
            hasSocket: !!socket,
            hasSession: !!session?.user
        });

        if (!currentChatInput.trim() || !socket || !session?.user) {
            console.warn("⚠️ Cannot send message: missing requirements");
            return;
        }

        if (activeChat.type === 'dm') {
            console.log(`Sending DM to ${activeChat.userId}`);
            socket.emit('send_dm', {
                fromId: session.user.id,
                fromName: session.user.name,
                toId: activeChat.userId,
                text: currentChatInput
            });
        } else {
            console.log("Sending global message");
            socket.emit('send_message', {
                userId: session.user.id,
                username: session.user.name,
                room: 'global',
                text: currentChatInput
            });
        }
        setCurrentChatInput("");
    };

    const startDM = (user) => {
        if (user.userId === session?.user?.id || user._id === session?.user?.id) return;
        setActiveChat({ type: 'dm', name: user.username || user.name, userId: user.userId || user._id });
    };

    const handleAddSentence = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/sentences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newSentenceText, difficulty: newSentenceDifficulty })
            });
            const data = await res.json();
            if (data.success) {
                setDbSentences(prev => [data.sentence, ...prev]);
                setNewSentenceText("");
                setShowAddSentence(false);
                toast.success("Sentence added to global practice list!");
            } else {
                toast.error(data.error || "Failed to add sentence");
            }
        } catch (err) {
            toast.error("Network error. Please try again.");
        }
    };

    useEffect(() => {
        if (results && session?.user?.id && !trainingWord) {
            // Target words calculation inside useEffect to avoid issues
            const targetWords = targetText.split(/\s+/).filter(w => w.length > 0);

            // Calculate dynamic fluency
            const wordCount = targetWords.length;
            const duration = results.duration || 1;
            const rawFluency = (results.accuracy * wordCount) / duration;
            const fluencyScore = Math.min(100, Math.round(rawFluency));

            // Send session telemetry to DB
            fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: session.user.id,
                    bookId: "650000000000000000000000", // Fallback generated ID
                    originalText: results.originalText,
                    transcribedText: results.spokenText,
                    accuracy: results.accuracy,
                    fluencyScore,
                    duration: results.duration || 0,
                    mistakes: results.wordResults.reduce((acc, w, idx) => {
                        if (w.status !== 'correct') {
                            let type = 'Mispronunciation';
                            if (w.status === 'skipped') type = 'Omission';
                            if (w.status === 'substitution') type = 'Substitution';
                            acc.push({
                                word: w.word,
                                type,
                                position: idx
                            });
                        }
                        return acc;
                    }, [])
                })
            }).catch(e => console.error("Failed to sync session:", e));
        }
    }, [results, session, trainingWord]);

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

    const handleExit = () => {
        if (isRecording) stopRecording();
        const roleRoute = session?.user?.role?.toLowerCase() || 'student';
        router.push(`/dashboard/${roleRoute}`);
    };

    const isManager = ['admin', 'facilitator'].includes(session?.user?.role?.toLowerCase());

    return (
        <DashboardShell role={session?.user?.role || 'Student'}>
            <div className={clsx("flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700 relative", isChatFullscreen ? "h-[calc(100vh-140px)]" : "h-[calc(100vh-140px)]")}>
                {/* Video & Transcription Area (Left/Center) */}
                <div className={clsx("flex-1 flex flex-col gap-6 transition-all duration-500", isChatFullscreen && "lg:opacity-0 lg:pointer-events-none lg:w-0 lg:flex-none")}>
                    {/* Video Grid */}
                    <div className="flex gap-4 h-full min-h-[400px]">
                        {/* Side Participants (Far Left) */}
                        <div className="hidden md:flex flex-col gap-3">
                            {[
                                { name: 'Joy', img: '/reading 3.jpeg' },
                                { name: 'Kezia', img: '/reading 4.jpeg' },
                                { name: 'Innocent', img: '/reading 1.jpg' }
                            ].map((p, i) => (
                                <div key={i} className="relative h-28 w-24 rounded-2xl overflow-hidden glass-panel group cursor-pointer hover:scale-105 transition-all">
                                    <img src={p.img} alt={p.name} className="h-full w-full object-cover" />
                                    <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[8px] text-white font-bold">
                                        {p.name}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Main Speaker (Center) */}
                        <div className="flex-1 relative rounded-5xl overflow-hidden glass-panel border-white/40 shadow-2xl">
                            <img
                                src="/reading 5.jpg"
                                className={clsx("h-full w-full object-cover transition-all duration-[2s]", !isCameraOn && "grayscale blur-sm opacity-50 shadow-inner")}
                                alt="Main Instructor"
                            />

                            {/* Camera Status Overlay */}
                            {!isCameraOn && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-md">
                                    <VideoOff size={60} className="text-white/40 mb-4" />
                                    <p className="text-white/60 font-black uppercase tracking-[0.3em] text-[10px]">Camera Disabled</p>
                                </div>
                            )}

                            {/* Overlay Controls */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-3 glass-pill p-2 border-white/20">
                                <button
                                    onClick={() => setIsCameraOn(!isCameraOn)}
                                    className={clsx(
                                        "p-3 rounded-2xl transition-all",
                                        isCameraOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/80 text-white shadow-xl"
                                    )}
                                    title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
                                >
                                    {isCameraOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
                                </button>
                                <button
                                    onClick={() => setIsAudioOn(!isAudioOn)}
                                    className={clsx(
                                        "p-3 rounded-2xl transition-all",
                                        isAudioOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/80 text-white shadow-xl"
                                    )}
                                    title={isAudioOn ? "Mute Speaker" : "Unmute Speaker"}
                                >
                                    {isAudioOn ? <Headphones size={20} /> : <VolumeX size={20} />}
                                </button>
                                <button
                                    onClick={() => setIsMicOn(!isMicOn)}
                                    className={clsx(
                                        "p-3 rounded-2xl transition-all",
                                        isMicOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/80 text-white shadow-xl"
                                    )}
                                    title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                                >
                                    {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                                </button>
                                <button
                                    onClick={handleExit}
                                    className="p-3 bg-red-500 hover:bg-red-600 rounded-2xl text-white shadow-lg transition-all scale-110"
                                    title="Exit Simulator"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Transcription Area */}
                    <div className="glass-panel rounded-5xl p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                        {trainingWord ? "Training Mode" : "Live Transcription"}
                                    </p>
                                    {(isManager) && (
                                        <button
                                            onClick={() => setShowAddSentence(true)}
                                            className="flex items-center bg-black text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl border border-white/20 whitespace-nowrap"
                                        >
                                            <Plus size={14} className="mr-1.5" /> Add Statement
                                        </button>
                                    )}
                                </div>
                                {trainingWord && (
                                    <button
                                        onClick={() => { setTrainingWord(null); setTranscript(""); }}
                                        className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        Cancel Training
                                    </button>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold leading-relaxed text-gray-800 flex flex-wrap gap-x-2 gap-y-2">
                                {liveWordResults.map((wr, i) => (
                                    <span key={i} className={clsx(
                                        "transition-all duration-300 rounded-md py-0.5",
                                        wr.status === 'correct' ? "text-green-500 font-black" :
                                            wr.status === 'skipped' ? "text-red-500 line-through opacity-70" :
                                                wr.status === 'current' ? "bg-black text-white px-2 shadow-md scale-110" :
                                                    "text-gray-800"
                                    )}>
                                        {wr.word}
                                    </span>
                                ))}
                            </h2>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/20">
                            <div className="flex items-center space-x-2">
                                <button className="active-pill px-6 py-2.5 rounded-full text-xs font-bold">Transcription</button>
                                {/* <button className="bg-white/60 hover:bg-white/80 px-6 py-2.5 rounded-full text-xs font-bold text-gray-500">Subtitle</button> */}
                            </div>
                            <div className="flex items-center space-x-6">
                                {isRecording && (
                                    <div className="flex items-center space-x-2 px-4 py-2 bg-red-50 rounded-full border border-red-200">
                                        <span className="text-xs font-black text-red-600">{timeLeft}s remaining</span>
                                    </div>
                                )}
                                <button onClick={handleToggleRecording} className={clsx("h-12 w-12 !rounded-full flex items-center justify-center transition-all duration-300", isRecording ? "bg-red-500" : "bg-black")}>
                                    <div className={clsx("h-3 w-3 bg-white transition-all rounded-sm", isRecording ? "scale-100" : "rounded-full scale-125")} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className={clsx(
                    "flex flex-col glass-panel rounded-5xl overflow-hidden shadow-xl transition-all duration-500 z-50",
                    isChatFullscreen ? "w-full absolute inset-0 lg:relative" : "w-full lg:w-[400px]"
                )}>
                    <div className="p-6 border-b border-white/20 flex flex-col gap-4 sticky top-0 bg-white/40 backdrop-blur-md z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {activeChat.type === 'dm' && (
                                    <button
                                        onClick={() => setActiveChat({ type: 'global', name: 'World Room' })}
                                        className="p-2 hover:bg-black/5 rounded-xl transition-all"
                                    >
                                        <ArrowRight className="h-4 w-4 rotate-180" />
                                    </button>
                                )}
                                <div>
                                    <h3 className="font-black text-xl text-gray-900 tracking-tight">{activeChat.name}</h3>
                                    <div className="flex items-center mt-1">
                                        <span className={clsx("h-2 w-2 rounded-full mr-2", activeChat.type === 'dm' ? "bg-blue-500" : "bg-green-500 animate-pulse")} />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            {activeChat.type === 'dm' ? "Private Conversation" : `${onlineUsers.length} Online Now`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsChatFullscreen(!isChatFullscreen)}
                                className={clsx("p-2.5 rounded-xl transition-all border shadow-sm", isChatFullscreen ? "bg-black text-white border-black" : "bg-white/80 hover:bg-white text-gray-400 border-gray-100")}
                            >
                                <Maximize2 size={18} />
                            </button>
                        </div>
                        {/* Online Users List */}
                        <div className="flex -space-x-3 overflow-x-auto pb-2 scrollbar-none">
                            {onlineUsers.map((u, i) => (
                                <div key={i} className="relative group cursor-pointer" onClick={() => startDM(u)}>
                                    <div className={clsx(
                                        "h-10 w-10 rounded-full border-2 border-white flex items-center justify-center shadow-sm bg-gray-100 transition-transform group-hover:scale-110",
                                        u.userId === session?.user?.id && "opacity-50 text-gray-400",
                                        u.userId !== session?.user?.id && "text-black"
                                    )}>
                                        <User size={20} />
                                    </div>
                                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide flex flex-col">
                        {(() => {
                            const filteredMessages = liveMessages.filter(msg => {
                                if (activeChat.type === 'global') {
                                    return msg.room === 'global' || (!msg.isDM && !msg.room);
                                } else {
                                    const dmRoom = `dm_${[session?.user?.id, activeChat.userId].sort().join("_")}`;
                                    return msg.room === dmRoom;
                                }
                            });

                            if (filteredMessages.length === 0) {
                                return (
                                    <div className="flex-1 flex items-center justify-center opacity-40">
                                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                                            Secure Connection Established<br />{activeChat.type === 'dm' ? `Say hi to ${activeChat.name}!` : "Welcome to the World Room"}
                                        </p>
                                    </div>
                                );
                            }

                            return filteredMessages.map((msg, i) => {
                                const isMe = msg.userId === session?.user?.id || msg.fromId === session?.user?.id;
                                const isDM = msg.isDM || (msg.room && msg.room.startsWith('dm_'));
                                return (
                                    <div key={i} className={clsx("flex items-end space-x-2 animate-in slide-in-from-bottom-2 duration-500", isMe && "flex-row-reverse space-x-reverse")}>
                                        {!isMe && (
                                            <div className="h-8 w-8 rounded-full border border-white shadow-sm flex-shrink-0 bg-gray-100 flex items-center justify-center text-black">
                                                <User size={14} />
                                            </div>
                                        )}
                                        <div className={clsx("max-w-[80%] flex flex-col space-y-1", isMe ? "items-end" : "items-start")}>
                                            <div className="flex items-baseline space-x-2 px-1">
                                                <span className="font-black text-[9px] text-gray-500 uppercase tracking-tighter">
                                                    {isMe ? "You" : (msg.username || msg.fromName || "Unknown")}
                                                    {isDM && <span className="ml-2 text-blue-500 border border-blue-200 px-1.5 rounded-full text-[7px]">Private</span>}
                                                </span>
                                                <span className="text-[7px] text-gray-400 font-bold">{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className={clsx(
                                                "p-4 text-[11px] font-medium leading-relaxed shadow-lg",
                                                isMe ? "bg-black text-white rounded-3xl rounded-tr-none" : "bg-white text-gray-800 rounded-3xl rounded-tl-none border border-gray-100"
                                            )}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-white/20 backdrop-blur-sm border-t border-white/40">
                        <div className="bg-white rounded-[32px] p-2 border border-black/5 shadow-2xl">
                            <form
                                className="flex items-center px-4 py-2 gap-4"
                                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                            >
                                <input
                                    type="text"
                                    value={currentChatInput}
                                    onChange={(e) => setCurrentChatInput(e.target.value)}
                                    placeholder={activeChat.type === 'dm' ? `Message ${activeChat.name}...` : "Broadcast to everyone..."}
                                    className="flex-1 bg-transparent text-[13px] font-bold focus:outline-none placeholder:text-gray-300 text-gray-900"
                                />
                                <button
                                    type="submit"
                                    disabled={!currentChatInput.trim()}
                                    className="bg-black text-white h-10 w-10 min-w-10 rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 disabled:opacity-20 transition-all"
                                >
                                    <Send size={16} fill="currentColor" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Popup */}
            {results && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-5xl p-10 max-w-lg w-full shadow-2xl space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="text-center space-y-2">
                            <div className="mx-auto h-20 w-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900">Great Job!</h2>
                            <p className="text-gray-500 font-medium pb-2">Here is your reading analysis.</p>
                        </div>

                        <div className="bg-gray-50 rounded-3xl p-6 flex items-center justify-between border border-gray-100">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Accuracy</p>
                                <p className="text-4xl font-black text-black">{results.accuracy}%</p>
                            </div>
                            <div className="flex space-x-1 text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={24} fill={i < Math.round(results.accuracy / 20) ? "currentColor" : "none"} className={i < Math.round(results.accuracy / 20) ? "" : "text-gray-300"} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900">Word Breakdown</h3>
                            <div className="flex flex-wrap gap-2 text-sm font-medium">
                                {results.wordResults.map((wr, i) => (
                                    <button
                                        key={i}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-xl border transition-transform",
                                            wr.status === 'correct' ? "bg-green-50 text-green-600 border-green-200 cursor-default" : "bg-red-50 text-red-600 border-red-200 cursor-pointer hover:scale-105 shadow-sm"
                                        )}
                                        onClick={() => {
                                            if (wr.status !== 'correct') {
                                                setTrainingWord(wr.word);
                                                setResults(null);
                                                setTranscript("");
                                            }
                                        }}
                                        title={wr.status !== 'correct' ? "Click to Train" : ""}
                                    >
                                        {wr.word}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center mt-2">Click any red word to train it alone</p>
                        </div>

                        <div className="pt-4 flex items-center space-x-4">
                            <button
                                onClick={() => {
                                    setResults(null);
                                    setTranscript("");
                                }}
                                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-2xl transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => {
                                    setResults(null);
                                    setTranscript("");
                                    if (trainingWord) {
                                        setTrainingWord(null);
                                    } else {
                                        setCurrentSentenceIndex((prev) => (prev + 1) % allSentences.length);
                                    }
                                }}
                                className="flex-1 py-4 btn-primary rounded-2xl transition-transform"
                            >
                                {trainingWord ? "Finish Training" : "Next"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Add Sentence Modal */}
            {showAddSentence && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-5xl p-10 max-w-lg w-full shadow-2xl space-y-8 animate-in zoom-in-95 duration-500 border border-white/20">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">New Practice Word/Sentence</h2>
                            <button onClick={() => setShowAddSentence(false)} className="p-2 hover:bg-gray-100 rounded-2xl transition-all">
                                <XCircle size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSentence} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Sentence Content</label>
                                <textarea
                                    value={newSentenceText}
                                    onChange={(e) => setNewSentenceText(e.target.value)}
                                    placeholder="Type the word or sentence for students to practice..."
                                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black min-h-[120px] resize-none"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Difficulty Level</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Easy', 'Medium', 'Hard'].map((lvl) => (
                                        <button
                                            key={lvl}
                                            type="button"
                                            onClick={() => setNewSentenceDifficulty(lvl)}
                                            className={clsx(
                                                "py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                newSentenceDifficulty === lvl
                                                    ? "bg-black text-white border-black shadow-lg scale-105"
                                                    : "bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200"
                                            )}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-black text-white font-black rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
                            >
                                <Plus size={20} />
                                <span>Save to Global Library</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </DashboardShell>
    );
}

export default function SimulatorPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-bold text-gray-400 animate-pulse">Loading Simulator...</div>}>
            <SimulatorContent />
        </Suspense>
    );
}
