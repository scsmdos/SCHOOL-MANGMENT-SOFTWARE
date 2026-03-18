import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Leaf, Music, Trophy, Star, Lightbulb, ShieldCheck } from 'lucide-react';
import slider1 from '../../assets/slider1.png';
import slider2 from '../../assets/slider2.png';
import slider3 from '../../assets/slider3.png';

const HeroSlider = () => {
    const slides = [
        {
            image: slider1,
            title: {
                pre: "Little Seeds",
                mid: " & ",
                post: "Play School"
            },
            heading: {
                p1: "Together ",
                p2: "we'll",
                p3: " explore ",
                p4: "new ",
                p5: "things"
            }
        },
        {
            image: slider2,
            title: {
                pre: "Learning",
                mid: " is ",
                post: "Fun & Joy"
            },
            heading: {
                p1: "Growing ",
                p2: "with",
                p3: " creative ",
                p4: "mind ",
                p5: "sets"
            }
        },
        {
            image: slider3,
            title: {
                pre: "Best",
                mid: " in ",
                post: "Class World"
            },
            heading: {
                p1: "Nurturing ",
                p2: "the",
                p3: " leaders ",
                p4: "of ",
                p5: "tomorrow"
            }
        }
    ];

    const [current, setCurrent] = useState(0);

    const nextSlide = () => {
        setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, []);

    const features = [
        { icon: <Leaf size={14} className="text-[#FBBF24]" />, text: "GREEN CAMPUS" },
        { icon: <Music size={14} className="text-[#FBBF24]" />, text: "MUSIC & DANCE" },
        { icon: <Trophy size={14} className="text-[#FBBF24]" />, text: "SPORTS ACADEMY" },
        { icon: <Star size={14} className="text-[#FBBF24]" />, text: "EXCELLENCE IN EDUCATION" },
        { icon: <Lightbulb size={14} className="text-[#FBBF24]" />, text: "CREATIVE LEARNING" },
        { icon: <ShieldCheck size={14} className="text-[#FBBF24]" />, text: "GPS SAFE..." }
    ];

    return (
        <section className="relative w-full overflow-hidden bg-white font-['Outfit',_sans-serif]">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: flex;
                    width: max-content;
                    animation: marquee 30s linear infinite;
                }
                .marquee-container:hover .animate-marquee {
                    animation-play-state: paused;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* Main Slider Area - Reduced height to 220px on mobile, 420px on desktop */}
            <div className="relative h-[200px] md:h-[420px] w-full">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        {/* Background Image with Reveal Fade */}
                        <div className="absolute inset-0 flex">
                            {/* Left Text Side - Smooth Left to Right Transition */}
                            <div className="w-[70%] md:w-[48%] h-full bg-gradient-to-r from-white via-white/95 to-transparent relative z-20 flex items-center px-4 md:px-16">
                                <div className="absolute right-0 top-0 bottom-0 w-16 md:w-80 bg-gradient-to-r from-transparent md:from-white to-transparent transform translate-x-full"></div>

                                <div className={`transform transition-all duration-700 delay-300 ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                    <p className="font-extrabold italic text-[12px] md:text-[20px] mb-1 md:mb-3 tracking-tight flex items-center space-x-1.5">
                                        <span className="text-[#FF5A2D]">Little </span>
                                        <span className="text-[#2DAF84]">Seeds </span>
                                        <span className="text-[#3B82F6]">& </span>
                                        <span className="text-[#EC4899]">Play </span>
                                        <span className="text-[#F59E0B]">School</span>
                                    </p>

                                    {/* Reduced font size from 76px to 54px */}
                                    <h1 className="text-[18px] md:text-[54px] font-[900] leading-tight tracking-tight text-[#1E293B] mb-4 md:mb-8">
                                        Together <span className="text-[#FF7E5F]">{slide.heading.p2}</span><br />
                                        <span className="text-[#2DAF84]">{slide.heading.p3}</span>
                                        <span className="text-[#3B82F6]">{slide.heading.p4}</span>
                                        <span className="text-[#FBBF24]">{slide.heading.p5}</span>
                                    </h1>

                                    <button className="bg-gradient-to-r from-[#FF7E5F] to-[#FF5A2D] text-white px-5 md:px-9 py-2 md:py-3 rounded-[4px] font-bold text-[10px] md:text-[14px] uppercase tracking-[0.1em] shadow-lg hover:-translate-y-1 transition-all">
                                        LEARN MORE
                                    </button>
                                </div>
                            </div>

                            {/* Right Image Side */}
                            <div className="absolute inset-0 md:relative md:w-[52%] h-full ml-auto overflow-hidden">
                                <img
                                    src={slide.image}
                                    className={`w-full h-full object-cover transform scale-110 md:scale-100 transition-transform duration-[6000ms] ${index === current ? 'scale-100' : 'scale-110'}`}
                                    alt="Little Seeds Slider"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/30 to-transparent hidden md:block"></div>
                                <div className="absolute inset-0 bg-transparent md:hidden"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Continuous Marquee bottom bar */}
            <div className="relative w-full bg-[#1EB286] py-3 h-12 md:h-14 overflow-hidden flex items-center z-40 marquee-container">
                <div className="animate-marquee space-x-12 px-12">
                    {/* First set of features */}
                    {features.map((item, idx) => (
                        <div key={`f1-${idx}`} className="flex items-center space-x-3 shrink-0">
                            {item.icon}
                            <span className="text-white text-[11px] md:text-[12px] font-black tracking-widest uppercase">
                                {item.text}
                            </span>
                        </div>
                    ))}
                    {/* Duplicate set for seamless scrolling */}
                    {features.map((item, idx) => (
                        <div key={`f2-${idx}`} className="flex items-center space-x-3 shrink-0">
                            {item.icon}
                            <span className="text-white text-[11px] md:text-[12px] font-black tracking-widest uppercase">
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSlider;
