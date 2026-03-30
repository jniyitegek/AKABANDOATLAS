"use client";

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import CourseCard from '@/components/courses/CourseCard';
import VideoPlayer from '@/components/courses/VideoPlayer';
import { Search, Filter, BookOpen, Clock, Video, ArrowRight, Play, Loader2 } from 'lucide-react';

export default function CoursesPage() {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterLevel, setFilterLevel] = useState("All Levels");
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/courses');
                const data = await res.json();
                if (data.success && data.courses.length > 0) {
                    setCourses(data.courses);
                }
            } catch (error) {
                console.error("Failed fetching live courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = filterLevel === "All Levels" || course.level === filterLevel;
        return matchesSearch && matchesLevel;
    });

    const cycleFilter = () => {
        const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
        const currentIndex = levels.indexOf(filterLevel);
        setFilterLevel(levels[(currentIndex + 1) % levels.length]);
    };

    return (
        <DashboardShell role="Student">
            <div className="mb-12 animate-in fade-in slide-in-from-left duration-700">
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Video Courses</h1>
                <p className="text-xl text-gray-500 font-medium">Pick a course and start learning at your own pace.</p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                <div className="flex-1 glass-pill flex items-center px-6 py-1 border-white/40 shadow-sm">
                    <Search className="h-5 w-5 text-gray-400 mr-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for courses, levels, or topics..."
                        className="w-full py-4 bg-transparent focus:outline-none font-semibold text-gray-700 placeholder:text-gray-400"
                    />
                </div>
                <button 
                    onClick={cycleFilter}
                    className="glass-pill flex items-center space-x-3 px-8 py-4 text-gray-600 font-bold hover:bg-white/80 transition-all border-white/40 shadow-sm"
                >
                    <Filter className="h-5 w-5" /> <span>{filterLevel}</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 flex flex-col items-center">
                    <Loader2 className="animate-spin h-10 w-10 text-gray-400 mb-4" />
                    <p className="text-gray-500 font-bold text-xl">Loading course directory...</p>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 font-bold text-xl">No courses found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredCourses.map((course) => (
                        <CourseCard
                            key={course._id || course.id}
                            course={{
                                ...course,
                                img: course.img || '/reading 2.avif'
                            }}
                            onClick={() => setSelectedVideo(course.videoUrl)}
                        />
                    ))}
                </div>
            )}

            {selectedVideo && (
                <VideoPlayer
                    videoUrl={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}

            {/* Hero Section Recommendation */}
            <div className="mt-20 p-12 bg-black rounded-[60px] text-white relative overflow-hidden group shadow-3xl">
                <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black via-black/40 to-transparent z-0" />
                <img
                    src="/reading 1.jpg"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:scale-105 transition-transform duration-[3s]"
                    alt="Hero"
                />

                <div className="max-w-xl relative z-10 space-y-8">
                    <div className="inline-flex bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-white/60">
                        Recommended for you
                    </div>
                    <h2 className="text-5xl font-black leading-tight tracking-tight">Mastering Literacy: <br /> The Complete Guide</h2>
                    <div className="flex items-center space-x-8 text-[10px] font-bold uppercase tracking-widest text-white/50">
                        <div className="flex items-center"><BookOpen className="h-4 w-4 mr-3" /> 24 Lessons</div>
                        <div className="flex items-center"><Clock className="h-4 w-4 mr-3" /> 4h 32m Total</div>
                    </div>
                    <button className="bg-white text-black font-black py-5 px-12 rounded-2xl flex items-center group/btn hover:bg-gray-100 transition-all shadow-2xl">
                        <span>Resume Learning</span>
                        <ArrowRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 -right-40 opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-[2s] pointer-events-none hidden lg:block">
                    <div className="h-[500px] w-[500px] rounded-full bg-white/20 backdrop-blur-3xl border border-white/10 flex items-center justify-center">
                        <Play size={100} fill="currentColor" />
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
