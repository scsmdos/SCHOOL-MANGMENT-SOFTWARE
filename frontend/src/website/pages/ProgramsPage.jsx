import React from 'react';
import PageHeader from '../components/PageHeader';
import { Target, Star, Brain, Heart, ChevronRight } from 'lucide-react';
import { AdmissionBanner, Footer } from '../components/Footer';
import p1 from '../../assets/image.png';
import p2 from '../../assets/image2.png';
import p3 from '../../assets/image3.png';
import p4 from '../../assets/image4.png';

const ProgramsPage = () => {
    const programs = [
        {
            subtitle: "1.5 - 2.5 YEARS",
            title: "Playgroup",
            desc: "A joyful introduction to school through songs, stories, and sensory play. Building first friendships and routines in a gentle, caring environment.",
            features: [
                "Music & Rhymes", "Sensory Play", "Free Movement", "Social Interaction"
            ],
            image: p1,
            color: "#FF5A2D",
            icon: Heart,
            bg: "bg-[#FFF9F1]",
            tagBg: "bg-[#FF5A2D]"
        },
        {
            subtitle: "2.5 - 3.5 YEARS",
            title: "Nursery",
            desc: "Children are introduced to early alphabet, numbers, and shapes through play-based activities and interactive storytelling.",
            features: [
                "Pre-Writing Skills", "Number Concepts", "Art & Craft", "Story Time"
            ],
            image: p2,
            color: "#22C55E",
            icon: Brain,
            bg: "bg-[#F0FDF4]",
            tagBg: "bg-[#22C55E]"
        },
        {
            subtitle: "3.5 - 5.5 YEARS",
            title: "LKG / UKG",
            desc: "Structured learning with focus on language, mathematics, and life skills. Building the foundation for primary school with confidence.",
            features: [
                "Reading & Writing", "Basic Maths", "Science Concepts", "Sports & Yoga"
            ],
            image: p3,
            color: "#3B82F6",
            icon: Star,
            bg: "bg-[#EFF6FF]",
            tagBg: "bg-[#3B82F6]"
        },
        {
            subtitle: "5.5 - 10 YEARS",
            title: "Class 1 - 5",
            desc: "A comprehensive primary curriculum covering all core subjects with regular assessments, projects, and extracurricular activities.",
            features: [
                "English, Hindi, Maths", "EVS / Science", "Computer Education", "Project Work"
            ],
            image: p4,
            color: "#FBBF24",
            icon: Target,
            bg: "bg-[#FFFDF1]",
            tagBg: "bg-[#FBBF24]"
        }
    ];

    return (
        <div className="w-full bg-white font-['Outfit',_sans-serif]">
            <PageHeader 
                subtitle="What We Offer"
                title={<>Our <span className="text-[#FBBF24]">Programs</span></>}
                description="Age-appropriate programs designed to nurture every stage of your child's growth."
            />

            <section className="py-8 px-6 md:px-20 max-w-7xl mx-auto space-y-12">
                {programs.map((item, i) => (
                    <div 
                        key={i} 
                        className={`flex flex-col ${i % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 lg:gap-20`}
                    >
                        {/* Text Content */}
                        <div className="w-full lg:w-1/2 space-y-5">
                            <div>
                                <div className={`inline-block px-3 py-1 rounded-full ${item.tagBg} text-white text-[9px] font-black tracking-widest uppercase mb-3`}>
                                    {item.subtitle}
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-white shadow-md`} style={{ backgroundColor: item.color }}>
                                        <item.icon size={18} className="md:w-5 md:h-5" />
                                    </div>
                                    <h2 className="text-[20px] md:text-[30px] font-[900] text-[#1E293B] leading-tight">{item.title}</h2>
                                </div>
                                <p className="text-[14px] md:text-[15px] font-medium text-slate-500 leading-relaxed max-w-[550px]">
                                    {item.desc}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                                {item.features.map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full flex items-center justify-center bg-[#FF5A2D]/10 text-[#FF5A2D]">
                                            <Star size={10} fill="#FF5A2D" />
                                        </div>
                                        <span className="text-[13px] md:text-[14px] font-black text-slate-600 tracking-tight">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="bg-[#FF5A2D] text-white px-8 py-3.5 rounded-[4px] font-black text-[12px] tracking-widest uppercase shadow-xl hover:bg-[#E04D25] transition-all flex items-center gap-2">
                                ENQUIRE NOW <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Image Content */}
                        <div className="w-full lg:w-1/2 relative group">
                            {/* Themed Dot Accent */}
                            <div className={`absolute -top-2 left-4 w-5 h-5 rounded-full shadow-md z-10 transition-transform group-hover:scale-125`} style={{ backgroundColor: item.color }}></div>
                            
                            <div className="rounded-[32px] overflow-hidden shadow-2xl relative">
                                <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full aspect-[4/3] object-cover object-top transition-transform duration-[1.5s] group-hover:scale-110" 
                                />
                                {/* Bottom decoration overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            <AdmissionBanner />
            <Footer />
        </div>
    );
};

export default ProgramsPage;
