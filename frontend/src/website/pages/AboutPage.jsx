import React from 'react';
import PageHeader from '../components/PageHeader';
import StatsSection from '../components/StatsSection';
import { Heart, Brain, Zap, Users, Star, Globe, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdmissionBanner, Footer } from '../components/Footer';
import aboutImg from '../../assets/image3.png';

const AboutPage = () => {
    const navigate = useNavigate();

    const values = [
        {
            title: "Care & Compassion",
            desc: "Every child is treated with love and respect, just like family.",
            icon: Heart,
            color: "#FF5A2D",
            bg: "bg-[#FFF9F1]"
        },
        {
            title: "Quality Education",
            desc: "Curriculum designed by expert educators focused on holistic growth.",
            icon: Brain,
            color: "#22C55E",
            bg: "bg-[#F0FDF4]"
        },
        {
            title: "Nature & Play",
            desc: "We believe children learn best through play and natural exploration.",
            icon: Globe,
            color: "#3B82F6",
            bg: "bg-[#EFF6FF]"
        },
        {
            title: "Community",
            desc: "Building strong futures between parents and community.",
            icon: Users,
            color: "#A855F7",
            bg: "bg-[#F5F3FF]"
        },
        {
            title: "Joyful Learning",
            desc: "Making every lesson fun, engaging and meaningful for kids.",
            icon: Zap,
            color: "#FBBF24",
            bg: "bg-[#FFFDF1]"
        },
        {
            title: "Excellence",
            desc: "Pursuing the highest standards in teaching and child development.",
            icon: Star,
            color: "#EC4899",
            bg: "bg-[#FDF2F8]"
        }
    ];

    return (
        <div className="w-full bg-white font-['Outfit',_sans-serif]">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes morphShape {
                    0%, 100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
                    25% { border-radius: 70% 30% 46% 54% / 30% 29% 71% 70%; }
                    50% { border-radius: 50% 50% 34% 66% / 56% 68% 32% 44%; }
                    75% { border-radius: 46% 54% 50% 50% / 35% 61% 39% 65%; }
                }
                .animate-morph-blob {
                    animation: morphShape 12s linear infinite;
                }
            `}} />

            <PageHeader
                subtitle="Who We Are"
                title={<>About <span className="text-[#FBBF24]">Little Seeds School</span></>}
                description="A nurturing place where every child's curiosity is celebrated and every dream is encouraged."
            />

            <section className="py-8 px-6 md:px-20 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                    {/* Left: Text Content */}
                    <div className="w-full lg:w-3/5 space-y-5">
                        <div>
                            <p className="text-[#FF5A2D] font-black text-[11px] md:text-[13px] tracking-[0.2em] uppercase mb-2">Our Story</p>
                            <h2 className="text-[18px] md:text-[32px] font-[900] text-[#1E293B] leading-[1.1] mb-5">
                                Our passion is <span className="text-[#FF5A2D]">childhood</span>
                            </h2>
                            <div className="space-y-4 text-slate-500 font-medium text-[13px] md:text-[16px] leading-relaxed">
                                <p>
                                    Little Seeds School was founded with a single, powerful vision — to create a school where children don't just learn, they thrive. Located in the heart of Banka, Bihar, we serve students from Playgroup to Class 5.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                "Activity-Based Learning",
                                "Safe Environment",
                                "Individual Attention",
                                "Qualified Teachers"
                            ].map((feat, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <CheckCircle2 size={20} className="text-[#22C55E]" />
                                    <span className="text-[14px] font-black text-[#1E293B]">{feat}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Morphing Image Shape */}
                    <div className="w-full lg:w-2/5 flex justify-center lg:justify-end relative">
                        <div className="absolute top-0 -left-10 w-20 h-20 bg-blue-100/50 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute bottom-0 -right-5 w-24 h-24 bg-orange-100/50 rounded-full blur-xl animate-pulse"></div>

                        <div className="w-[280px] md:w-[360px] aspect-square relative z-10 group cursor-pointer">
                            <div className="absolute inset-0 border-[6px] border-[#FF5A2D] animate-morph-blob opacity-20 scale-110 group-hover:scale-105 transition-transform duration-700"></div>

                            <div className="absolute inset-0 animate-morph-blob overflow-hidden shadow-2xl shadow-slate-200 border-4 border-white transition-all duration-700 group-hover:rotate-1">
                                <img
                                    src={aboutImg}
                                    alt="Our Story"
                                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                                />
                            </div>

                            <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-[#FBBF24] shadow-lg flex items-center justify-center text-white z-20 animate-bounce">
                                <Heart size={14} fill="white" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-20 bg-slate-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-[#3B82F6] font-[900] text-[14px] md:text-[15px] tracking-[0.2em] uppercase mb-4">Core Values</p>
                        <h2 className="text-[34px] md:text-[44px] font-[900] text-[#1E293B] leading-tight">What we believe in</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.map((v, i) => (
                            <div key={i} className="bg-white p-10 rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] flex flex-col items-center text-center group hover:shadow-xl transition-all hover:-translate-y-2 border border-slate-50">
                                <div className={`w-16 h-16 rounded-[24px] ${v.bg} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                                    <v.icon size={28} style={{ color: v.color }} />
                                </div>
                                <h3 className="text-[20px] font-black text-[#1E293B] mb-4">{v.title}</h3>
                                <p className="text-[14px] font-medium text-slate-500 leading-relaxed max-w-[280px]">
                                    {v.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reuse Stats Counter Section */}
            <StatsSection />

            {/* Bottom Contact CTA */}
            <section className="bg-white py-20 px-6">
                <div className="max-w-7xl mx-auto bg-[#FF5A2D] rounded-[40px] p-10 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl shadow-orange-100 relative overflow-hidden">
                    {/* Decorative background circle */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>

                    <div className="text-white text-center lg:text-left relative z-10">
                        <h2 className="text-[36px] md:text-[48px] font-[900] leading-tight mb-3">Want to know more?</h2>
                        <p className="text-[14px] md:text-[16px] font-black tracking-widest uppercase opacity-90">Visit us or drop a message ... we'd love to hear from you!</p>
                    </div>

                    <button
                        onClick={() => navigate('/contact')}
                        className="bg-[#091E3E] text-white px-12 py-5 rounded-[4px] font-black text-[13px] tracking-widest uppercase hover:bg-[#0C2A54] transition-all shadow-xl relative z-10"
                    >
                        CONTACT US
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutPage;
