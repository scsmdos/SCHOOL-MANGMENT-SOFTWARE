import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
    const reviews = [
        {
            name: "Rajesh Patel",
            role: "PARENT OF AAROHI, CLASS 2",
            initials: "RP",
            quote: '"Little Seeds has completely transformed my daughter\'s love for learning. She loves it!"',
            color: "#3B82F6",
            bgColor: "bg-[#EFF6FF]"
        },
        {
            name: "Sunita Kumari",
            role: "PARENT OF ARJUN, NURSERY",
            initials: "SK",
            quote: '"My son was shy, but now he is confident and very happy. Amazing school and staff!"',
            color: "#22C55E",
            bgColor: "bg-[#F0FDF4]"
        },
        {
            name: "Priya Mehta",
            role: "PARENT OF RIYA, LKG",
            initials: "PM",
            quote: '"The parent app is amazing — live attendance and results on my phone. Great tech!"',
            color: "#EC4899",
            bgColor: "bg-[#FDF2F8]"
        }
    ];

    return (
        <section className="py-14 px-6 bg-slate-50 relative overflow-hidden font-['Outfit',_sans-serif]">
            <div className="max-w-7xl mx-auto text-center mb-10">
                 {/* Floating badge label */}
                <div className="inline-block px-4 py-1.5 rounded-full bg-[#F3E8FF] text-[#A855F7] text-[11px] font-black tracking-widest uppercase mb-2">
                    Testimonials
                </div>
                <h2 className="text-[34px] md:text-[42px] font-[900] leading-tight tracking-tight text-[#1E293B]">
                    What Parents Say
                </h2>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {reviews.map((rev, index) => (
                    <div key={index} className="bg-white p-8 rounded-[30px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col items-start transition-all hover:-translate-y-2">
                        {/* 5 Stars */}
                        <div className="flex space-x-0.5 mb-6 text-[#FBBF24]">
                            {[1,2,3,4,5].map(i => <Star key={i} size={15} fill="currentColor" />)}
                        </div>
                        
                        {/* Quote Text */}
                        <p className="text-[15px] md:text-[16px] font-medium italic text-slate-500 mb-10 leading-relaxed text-left">
                            {rev.quote}
                        </p>

                        {/* Profile Info Row */}
                        <div className="flex items-center space-x-4 mt-auto">
                            {/* Initials Circle */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-black ${rev.bgColor}`} style={{ color: rev.color }}>
                                {rev.initials}
                            </div>
                            <div className="flex flex-col text-left">
                                <h4 className="text-[16px] font-black text-[#1E293B] mb-0.5">{rev.name}</h4>
                                <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase">{rev.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TestimonialsSection;
