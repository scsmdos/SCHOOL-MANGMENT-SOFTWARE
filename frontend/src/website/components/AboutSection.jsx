import React from 'react';
import { ChevronRight } from 'lucide-react';
import aboutImg from '../../assets/image6.png';

const AboutSection = () => {
    return (
        <section className="py-12 px-6 md:px-20 bg-[#FFFAF1] relative overflow-hidden font-['Outfit',_sans-serif]">
            <style>{`
                @keyframes float {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(15px, -15px) rotate(2deg); }
                    66% { transform: translate(-10px, 10px) rotate(-1deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                @keyframes float-reverse {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(-20px, 15px) rotate(-3deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                @keyframes circle-entry {
                    from { transform: scale(0.8) opacity: 0; }
                    to { transform: scale(1) opacity: 1; }
                }
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                .animate-float-slow {
                    animation: float-reverse 10s ease-in-out infinite;
                }
                .about-img-container {
                    animation: circle-entry 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
            
            {/* Background Floating Blobs */}
            <div className="absolute top-20 right-[40%] w-24 h-24 bg-[#3B82F6] opacity-40 rounded-full blur-2xl animate-float-slow hidden md:block"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#FBBF24] opacity-40 rounded-full blur-2xl animate-float hidden md:block"></div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                
                {/* Text Content Area */}
                <div className="w-full md:w-1/2 space-y-5">
                    <p className="text-[#FF5A2D] font-black text-[14px] md:text-[15px] tracking-[0.2em] uppercase">
                        About Little Seeds School
                    </p>
                    
                    <h2 className="text-[32px] md:text-[38px] font-[900] leading-[1.1] tracking-tight text-[#1E293B]">
                        Our passion is <span className="text-[#FB923C]">childhood</span>, and we're in little seeds
                    </h2>
                    
                    <div className="space-y-3 text-slate-500 font-medium text-[14px] md:text-[16px] leading-relaxed max-w-[550px]">
                        <p>
                            Little Seeds School is a caring and child-friendly school for students from Playgroup to Class 5.
                        </p>
                        <p>
                            We focus on building a strong foundation through joyful, activity-based learning. Our experienced teachers provide individual attention and create a safe environment.
                        </p>
                    </div>

                    <button className="group bg-[#FF5A2D] text-white px-7 py-3 rounded-[4px] font-bold text-[12px] tracking-widest uppercase flex items-center gap-2 hover:bg-[#E04D25] transition-all shadow-lg hover:shadow-orange-200">
                        LEARN MORE
                        <ChevronRight size={17} className="transition-transform group-hover:translate-x-1" />
                    </button>
                </div>

                {/* Imagery Area with Blobs */}
                <div className="w-full md:w-1/2 relative flex justify-center">
                    {/* Blue Blob (Top Left) */}
                    <div className="absolute top-0 left-0 md:left-4 w-16 h-28 bg-[#8AB9F1] rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%] animate-float-slow z-0"></div>
                    
                    {/* Orange Blob (Bottom Left behind main circle) */}
                    <div className="absolute top-10 right-4 w-12 h-12 bg-[#FF7E5F] rounded-full animate-float z-0"></div>

                    {/* Main Circular Image */}
                    <div className="about-img-container relative w-72 h-72 md:w-[420px] md:h-[420px] z-10 transition-transform hover:scale-[1.02] duration-500">
                        {/* Light Green Decorative Circle Behind */}
                        <div className="absolute inset-0 rounded-full bg-[#E0F3EB] scale-105 transform -translate-x-2 translate-y-2 z-0"></div>
                        
                        {/* Main Image with Border */}
                        <div className="absolute inset-0 rounded-full border-[6px] md:border-[8px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden z-20">
                            <img 
                                src={aboutImg} 
                                alt="Students in Classroom" 
                                className="w-full h-full object-cover transition-all duration-700"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/600?text=About+Us'; }}
                            />
                        </div>

                        {/* Yellow Blob (Bottom Right) */}
                        <div className="absolute bottom-2 right-2 md:bottom-6 md:right-6 w-16 h-16 md:w-24 md:h-24 bg-[#FBBF24] rounded-full z-30 animate-float opacity-80 mix-blend-multiply"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
