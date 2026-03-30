import React from 'react';
import { Play, Pause, RotateCcw, Volume2, Maximize, X, SkipBack, SkipForward, AlertTriangle } from 'lucide-react';

const getYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export default function VideoPlayer({ videoUrl, onClose }) {
    if (!videoUrl) return null;

    const videoId = getYouTubeID(videoUrl);

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in-95 duration-500">
            <button
                onClick={onClose}
                className="absolute top-8 right-8 text-white/50 hover:text-white bg-white/10 p-5 rounded-3xl transition-all hover:scale-110 active:scale-90 shadow-xl border border-white/20 z-[110]"
            >
                <X className="h-6 w-6" />
            </button>

            <div className="w-full max-w-6xl aspect-video rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden bg-black border border-white/10">
                {videoId ? (
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    ></iframe>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/50">
                        <AlertTriangle className="h-16 w-16 mb-4 opacity-50" />
                        <h2 className="text-2xl font-bold">Invalid Video Link</h2>
                        <p className="mt-2 text-sm">The provided URL cannot be resolved to a YouTube video.</p>
                        <p className="mt-1 text-xs opacity-50">{videoUrl}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
