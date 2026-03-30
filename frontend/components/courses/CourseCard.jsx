import React from 'react';
import { PlayCircle, Clock, BookOpen, Star, Play } from 'lucide-react';
import { clsx } from 'clsx';

const getYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export default function CourseCard({ course, onClick }) {
    const { title, description, duration, level, lessonsCount, rating, img, videoUrl } = course;

    const videoId = getYouTubeID(videoUrl);
    const resolvedImage = videoId 
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` 
        : (img || "/reading 2.avif");

    return (
        <div
            onClick={onClick}
            className="glass-panel rounded-5xl overflow-hidden group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-700"
        >
            <div className="aspect-video relative overflow-hidden">
                <img
                    src={resolvedImage}
                    alt={title}
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                />

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-500">
                        <Play className="h-6 w-6 text-white fill-current ml-1" />
                    </div>
                </div>

                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold text-white flex items-center border border-white/20">
                    <Clock className="h-3 w-3 mr-1.5" /> {duration}
                </div>

                <div className="absolute top-4 left-4">
                    <div className="active-pill px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em]">
                        {level}
                    </div>
                </div>
            </div>

            <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-black transition-colors mb-3 line-clamp-1 leading-tight">{title}</h3>
                <p className="text-sm font-medium text-gray-400 mb-6 line-clamp-2 leading-relaxed">{description}</p>

                <div className="flex items-center justify-between pt-6 border-t border-white/20">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <BookOpen className="h-3.5 w-3.5 mr-2 text-gray-400" /> {lessonsCount} Lessons
                        </div>
                        <div className="flex items-center text-[10px] font-bold text-gray-900 uppercase tracking-widest">
                            <Star className="h-3.5 w-3.5 mr-2 text-yellow-500 fill-current" /> {rating}
                        </div>
                    </div>
                    <button className="h-10 w-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                        <Play size={14} fill="currentColor" className="ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
