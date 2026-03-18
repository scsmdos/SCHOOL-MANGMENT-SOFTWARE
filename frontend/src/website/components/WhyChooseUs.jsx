import React from 'react';
import { Heart, Shield, Users, Palette } from 'lucide-react';
import img1 from '../../assets/image.png';
import img2 from '../../assets/image2.png';
import img3 from '../../assets/image3.png';
import img4 from '../../assets/image4.png';

const WhyChooseUs = () => {
    const items = [
        {
            image: img1,
            icon: <Heart size={16} fill="white" />,
            title: "Home-like environment",
            color: "#22C55E",
            bgColor: "bg-[#22C55E]",
            pos: "object-top"
        },
        {
            image: img2,
            icon: <Shield size={16} fill="white" />,
            title: "Safety and security",
            color: "#0EA5E9",
            bgColor: "bg-[#0EA5E9]",
            pos: "object-top"
        },
        {
            image: img3,
            icon: <Users size={16} fill="white" />,
            title: "Quality educators",
            color: "#F97316",
            bgColor: "bg-[#F97316]",
            pos: "object-center"
        },
        {
            image: img4,
            icon: <Palette size={16} fill="white" />,
            title: "Play to learn",
            color: "#FBBF24",
            bgColor: "bg-[#FBBF24]",
            pos: "object-center"
        }
    ];

    return (
        <section className="py-12 px-6 bg-white font-['Outfit',_sans-serif]">
            <style>{`
                @keyframes rotate-dashed {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .feature-card {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                .dashed-border {
                    animation: rotate-dashed 12s linear infinite;
                }
                .feature-card:hover .dashed-border {
                    animation-duration: 4s;
                }
                .feature-card:hover img {
                    transform: scale(1.05);
                }
            `}</style>
            
            <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between items-start gap-8 md:gap-0">
                {items.map((item, index) => (
                    <div 
                        key={index} 
                        className="feature-card group flex flex-col items-center text-center w-full md:w-[22%] opacity-0"
                        style={{ animationDelay: `${index * 0.2}s` }}
                    >
                        {/* Circular Image Container */}
                        <div className="relative w-48 h-48 md:w-56 md:h-56 mb-6">
                            {/* Rotating Dashed Border */}
                            <div 
                                className="absolute inset-[-10px] rounded-full border-[3px] border-dashed dashed-border border-opacity-40 transition-all duration-500"
                                style={{ borderColor: item.color }}
                            ></div>
                            
                            {/* Solid White Outer Border */}
                            <div className="absolute inset-0 rounded-full border-[6px] border-white shadow-xl z-10 overflow-hidden bg-slate-50">
                                <img 
                                    src={item.image} 
                                    alt={item.title}
                                    className={`w-full h-full ${item.pos} object-cover transition-transform duration-700 ease-in-out grayscale-[0.2] group-hover:grayscale-0`}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Kid'; }}
                                />
                            </div>

                            {/* Info Badge Badge at Top Right */}
                            <div className={`absolute top-2 right-2 md:top-4 md:right-4 w-10 h-10 md:w-11 md:h-11 rounded-full ${item.bgColor} shadow-lg z-20 flex items-center justify-center text-white transform transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110`}>
                                {item.icon}
                            </div>
                        </div>

                        {/* Feature Title */}
                        <h3 className="text-[17px] md:text-[20px] font-black tracking-tight text-[#1E293B] group-hover:text-amber-500 transition-colors duration-300">
                            {item.title}
                        </h3>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WhyChooseUs;
