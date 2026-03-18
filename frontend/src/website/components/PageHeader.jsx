import React from 'react';

const PageHeader = ({ title, subtitle, description, titleColor = "text-white" }) => {
    return (
        <section className="bg-[#091E3E] py-8 md:py-12 px-6 text-center font-['Outfit',_sans-serif] relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10">
                {subtitle && (
                    <p className="text-[#FF5A2D] font-black text-[11px] md:text-[15px] tracking-[0.2em] uppercase mb-2">
                        {subtitle}
                    </p>
                )}
                <h1 className={`text-[22px] md:text-[42px] font-[900] leading-tight tracking-tight ${titleColor}`}>
                    {title}
                </h1>
                {description && (
                    <p className="mt-3 text-white/70 text-[13px] md:text-[17px] font-medium max-w-2xl mx-auto leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
            
            {/* Subtle background decorative shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </section>
    );
};

export default PageHeader;
