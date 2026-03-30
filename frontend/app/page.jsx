import Link from 'next/link';
import { BookOpen, Mic2, Star, Target, Users, ArrowRight, Play, Globe, Shield, Zap, ArrowLeft } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header / Navigation */}
            <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-5xl">
                <div className="glass-panel px-10 py-5 rounded-[40px] border-white/60 shadow-2xl flex items-center justify-between">
                    <Logo size="normal" />
                    <div className="hidden md:flex items-center space-x-12">
                        <Link href="#features" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors">Experience</Link>
                        <Link href="#mission" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors">Mission</Link>
                        <Link href="/auth/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 hover:opacity-70 transition-opacity">Login</Link>
                        <Link href="/auth/register" className="active-pill px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all">
                            Join Portal
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden bg-concentric">
                {/* Ambient Glows */}
                <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-blue-600/20 blur-[180px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-white/5 blur-[150px] rounded-full" />

                <div className="container mx-auto px-6 text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black tracking-[0.4em] uppercase mb-12">
                        <Zap className="h-3 w-3 text-white" /> The Future of Literacy
                    </div>

                    <h1 className="text-6xl md:text-9xl font-black text-white leading-[0.9] tracking-tighter mb-10">
                        LIGHTING THE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">PATH TO FREEDOM</span>
                    </h1>

                    <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-400 font-medium mb-16 leading-relaxed">
                        Akabando Atlas is a digital bridge for underserved students, combining <span className="text-white">Afro-centric storytelling</span> with AI speech analysis to master global literacy.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <Link href="/auth/register" className="h-20 px-14 bg-white text-black text-lg font-black rounded-[30px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl">
                            Join the Portal <ArrowRight className="ml-4 h-6 w-6" />
                        </Link>
                        <Link href="#features" className="group flex items-center text-[10px] font-black text-gray-400 hover:text-white transition-all uppercase tracking-[0.5em]">
                            Our Ecosystem <span className="ml-4 h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all"><Play className="h-4 w-4 fill-current ml-1" /></span>
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
                    <div className="w-[1px] h-20 bg-gradient-to-b from-transparent to-white" />
                </div>
            </section>

            {/* Features Ecosystem */}
            <section id="features" className="py-40 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-12">
                        <div className="max-w-2xl">
                            <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-8">
                                A HOLISTIC <br /> ECOSYSTEM
                            </h2>
                            <p className="text-xl text-gray-500 font-medium leading-relaxed">
                                We've built an interconnected suite of tools designed to break the cycle of learning poverty through culture and technology.
                            </p>
                        </div>
                        <div className="h-32 w-32 border-[20px] border-black/5 rounded-full flex items-center justify-center">
                            <div className="h-6 w-6 bg-black rounded-full" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        <FeatureCard
                            icon={BookOpen}
                            title="Global Library"
                            desc="Access hundreds of curated afro-centric story books designed for local contexts."
                            img="/reading 1.jpg"
                        />
                        <FeatureCard
                            icon={Mic2}
                            title="Speech AI"
                            desc="Speak aloud and receive instant AI-powered feedback on fluency and tone."
                            img="/reading 2.avif"
                        />
                        <FeatureCard
                            icon={Target}
                            title="Insight Engine"
                            desc="Detailed analytics showing reading growth and mastery over time."
                            img="/reading 3.jpeg"
                        />
                        <FeatureCard
                            icon={Users}
                            title="Teacher Hub"
                            desc="Empowering educators with predictive insights to support every student."
                            img="/reading 4.jpeg"
                        />
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section id="mission" className="py-40 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="glass-panel rounded-[80px] border-white/40 shadow-3xl overflow-hidden flex flex-col lg:flex-row">
                        <div className="lg:w-1/2 relative min-h-[400px]">
                            <img
                                src="/reading 5.jpg"
                                className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                                alt="Mission"
                            />
                            <div className="absolute inset-0 bg-black/20" />
                        </div>
                        <div className="lg:w-1/2 p-16 md:p-24 flex flex-col justify-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8 block">Our Calling</span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-10 tracking-tighter">STOPPING LEARNING POVERTY IN RWANDA</h2>
                            <p className="text-xl text-gray-500 font-medium mb-12 leading-relaxed">
                                In Sub-Saharan Africa, many children struggle to understand a simple sentence by age 10. We believe every child deserves the gift of literacy. Akabando Atlas provides the tools, the content, and the community to make that future a reality.
                            </p>
                            <div className="flex items-center gap-12">
                                <div className="text-center">
                                    <p className="text-4xl font-black text-gray-900 leading-none mb-2">12k+</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Students</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-4xl font-black text-gray-900 leading-none mb-2">450+</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Schools</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-4xl font-black text-gray-900 leading-none mb-2">94%</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-concentric text-white pt-40 pb-20 relative overflow-hidden border-t border-white/5">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />

                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-20 mb-32 relative z-10">
                    <div className="md:col-span-2">
                        <Logo size="normal" isDark={true} />
                        <p className="mt-12 text-2xl text-gray-500 font-medium max-w-sm leading-relaxed">
                            Igniting the passion for reading in underserved communities through technology and culture.
                        </p>
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10">Platform</h5>
                        <ul className="space-y-6">
                            <li><Link href="#" className="text-lg text-gray-500 hover:text-white transition-colors">Library</Link></li>
                            <li><Link href="#" className="text-lg text-gray-500 hover:text-white transition-colors">Courses</Link></li>
                            <li><Link href="#" className="text-lg text-gray-500 hover:text-white transition-colors">Simulator</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10">Connect</h5>
                        <ul className="space-y-6">
                            <li><Link href="#" className="text-lg text-gray-500 hover:text-white transition-colors">Twitter</Link></li>
                            <li><Link href="#" className="text-lg text-gray-500 hover:text-white transition-colors">LinkedIn</Link></li>
                            <li><Link href="#" className="text-lg text-gray-500 hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between pt-20 border-t border-white/5 relative z-10">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                        © 2026 Akabando Atlas. Built for Rwandan Education.
                    </p>
                    <div className="flex items-center gap-12 mt-8 md:mt-0">
                        <Link href="#" className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-[0.3em] transition-colors">Privacy Policy</Link>
                        <Link href="#" className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-[0.3em] transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc, img }) {
    return (
        <div className="glass-panel p-8 rounded-[50px] border-white/60 hover:shadow-3xl hover:-translate-y-4 transition-all duration-700 group cursor-default">
            <div className="aspect-[4/3] rounded-[30px] overflow-hidden mb-10 relative">
                <img src={img} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt={title} />
                <div className="absolute top-6 left-6 h-12 w-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-black shadow-xl">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight group-hover:text-black transition-colors">{title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed text-sm">{desc}</p>
        </div>
    );
}
