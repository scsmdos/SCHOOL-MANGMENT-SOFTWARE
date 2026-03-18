import React from 'react';

const StatsSection = () => {
    const stats = [
        { label: "HAPPY STUDENTS", value: "500+" },
        { label: "QUALIFIED TEACHERS", value: "30+" },
        { label: "YEARS OF TRUST", value: "10+" },
        { label: "PARENT SATISFACTION", value: "95%" }
    ];

    return (
        <section className="bg-[#091E3E] py-12 px-6 font-['Outfit',_sans-serif]">
            <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                {stats.map((stat, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <span className="text-[42px] md:text-[54px] font-[900] text-[#FBBF24] leading-none mb-3">
                            {stat.value}
                        </span>
                        <span className="text-white text-[12px] md:text-[13px] font-black tracking-[0.2em] uppercase opacity-80">
                            {stat.label}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default StatsSection;
