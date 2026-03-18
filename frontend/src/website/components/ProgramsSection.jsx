import React from 'react';
import { ChevronRight } from 'lucide-react';
import p1 from '../../assets/image.png';
import p2 from '../../assets/image2.png';
import p3 from '../../assets/image3.png';
import p4 from '../../assets/image4.png';

const ProgramsSection = () => {
    const programs = [
        {
            title: "Toddler",
            age: "(1.5-3 years)",
            desc: "Specialized learning and growth activities for your little ones.",
            image: p1,
            color: "#F87171",
            bgColor: "bg-[#FEF2F2]"
        },
        {
            title: "Preschool",
            age: "(1.5-3 years)",
            desc: "Specialized learning and growth activities for your little ones.",
            image: p2,
            color: "#34D399",
            bgColor: "bg-[#ECFDF5]"
        },
        {
            title: "Kindergarten",
            age: "(4-5 years)",
            desc: "Specialized learning and growth activities for your little ones.",
            image: p3,
            color: "#3B82F6",
            bgColor: "bg-[#EFF6FF]"
        },
        {
            title: "Flex-care",
            age: "(5-12 years)",
            desc: "Specialized learning and growth activities for your little ones.",
            image: p4,
            color: "#FB923C",
            bgColor: "bg-[#FFF7ED]"
        }
    ];

    return (
        <section className="py-14 px-6 bg-white font-['Outfit',_sans-serif]">
            <div className="max-w-7xl mx-auto text-center mb-10">
                <p className="text-[#3B82F6] font-[900] text-[14px] md:text-[15px] tracking-[0.2em] uppercase mb-2">
                    Our Programs
                </p>
                <h2 className="text-[34px] md:text-[44px] font-[900] leading-[1.15] tracking-tight text-[#1E293B] max-w-[800px] mx-auto">
                    We meet kids at their level regardless of their age
                </h2>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                {programs.map((item, index) => (
                    <div 
                        key={index} 
                        className={`${item.bgColor} rounded-[40px] p-8 pb-12 relative flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-100 group`}
                    >
                        {/* Top Accent Dot */}
                        <div className="absolute -top-3 w-6 h-6 rounded-full shadow-md z-10" style={{ backgroundColor: item.color }}></div>
                        
                        {/* Rounded Image */}
                        <div className="w-full aspect-[4/3] rounded-[30px] overflow-hidden mb-8 shadow-sm">
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>

                        {/* Text Details */}
                        <h3 className="text-[22px] font-[900] text-[#1E293B] mb-1">{item.title}</h3>
                        <p className="text-[12px] font-black uppercase tracking-widest mb-4" style={{ color: item.color }}>
                            {item.age}
                        </p>
                        <p className="text-[14px] font-medium text-slate-500 leading-relaxed mb-10 opacity-90 px-2">
                            {item.desc}
                        </p>

                        {/* Centered Bottom Button */}
                        <button className="absolute -bottom-6 w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 group-active:scale-95 z-20" style={{ backgroundColor: item.color }}>
                            <ChevronRight size={24} strokeWidth={3} />
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProgramsSection;
