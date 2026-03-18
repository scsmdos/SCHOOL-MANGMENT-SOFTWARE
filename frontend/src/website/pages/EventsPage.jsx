import React from 'react';
import PageHeader from '../components/PageHeader';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import { AdmissionBanner, Footer } from '../components/Footer';

const EventsPage = () => {
    const upcoming = [
        {
            tag: "SPORTS",
            title: "Annual Sports Day",
            desc: "A day full of fun races, team games, and exciting competitions for all students. Parents are invited to cheer!",
            date: "March 20, 2026",
            time: "9:00 AM - 12:00 PM",
            location: "School Ground, Little Seeds Campus",
            color: "border-[#3B82F6]",
            tagBg: "bg-[#EFF6FF]",
            tagColor: "text-[#3B82F6]"
        },
        {
            tag: "EXHIBITION",
            title: "Science & Art Exhibition",
            desc: "Students showcase their creative science models and art pieces. A celebration of imagination and discovery at school.",
            date: "April 5, 2026",
            time: "10:00 AM - 3:00 PM",
            location: "School Hall",
            color: "border-[#A855F7]",
            tagBg: "bg-[#F5F3FF]",
            tagColor: "text-[#A855F7]"
        },
        {
            tag: "FESTIVAL",
            title: "Annual Day Function",
            desc: "Our grand annual celebration with dance, drama, music performances by students, prize distribution and more!",
            date: "April 28, 2026",
            time: "5:00 PM - 8:00 PM",
            location: "Town Hall, Banka",
            color: "border-[#F97316]",
            tagBg: "bg-[#FFF7ED]",
            tagColor: "text-[#F97316]"
        },
        {
            tag: "MEETING",
            title: "Parent-Teacher Meeting",
            desc: "A chance for parents to meet teachers one-on-one, discuss child progress, and share feedback.",
            date: "May 12, 2026",
            time: "9:00 AM - 12:00 PM",
            location: "School Classrooms",
            color: "border-[#22C55E]",
            tagBg: "bg-[#F0FDF4]",
            tagColor: "text-[#22C55E]"
        }
    ];

    const past = [
        {
            tag: "NATIONAL EVENT",
            title: "Republic Day Celebration",
            date: "January 26, 2026",
            venue: "School Ground",
            iconBg: "bg-[#FF5A2D]"
        },
        {
            tag: "CELEBRATION",
            title: "Christmas & New Year Party",
            date: "December 25, 2025",
            venue: "School Hall",
            iconBg: "bg-[#F87171]"
        }
    ];

    return (
        <div className="w-full bg-white font-['Outfit',_sans-serif]">
            <PageHeader 
                subtitle="What's Happening"
                title={<>School <span className="text-[#FBBF24]">Events</span></>}
                description="Stay updated with all the exciting activities and celebrations at Little Seeds School."
            />

            <section className="py-12 px-6 md:px-20 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-[#FF5A2D]">
                        <Ticket size={20} className="rotate-[-25deg]" />
                    </div>
                    <h2 className="text-[24px] md:text-[30px] font-[900] text-[#1E293B]">Upcoming Events</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {upcoming.map((event, i) => (
                        <div key={i} className={`bg-white rounded-[24px] border-t-4 ${event.color} p-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)] flex flex-col hover:shadow-xl transition-all`}>
                            <div className={`px-4 py-1 rounded-full ${event.tagBg} ${event.tagColor} text-[10px] font-black tracking-widest uppercase w-max mb-6`}>
                                {event.tag}
                            </div>
                            <h3 className="text-[20px] font-black text-[#1E293B] mb-4">{event.title}</h3>
                            <p className="text-[14px] font-medium text-slate-500 leading-relaxed mb-8 flex-grow">
                                {event.desc}
                            </p>
                            
                            <ul className="space-y-4 text-[13px] font-bold text-slate-400 mb-8 border-t border-slate-50 pt-6">
                                <li className="flex items-center gap-3">
                                    <Calendar size={15} className="text-[#FF5A2D]" /> {event.date}
                                </li>
                                <li className="flex items-center gap-3">
                                    <Clock size={15} className="text-[#FF5A2D]" /> {event.time}
                                </li>
                                <li className="flex items-center gap-3">
                                    <MapPin size={15} className="text-[#FF5A2D]" /> {event.location}
                                </li>
                            </ul>

                            <button className="w-full bg-[#FF5A2D] text-white py-3.5 rounded-[4px] font-black text-[12px] tracking-widest uppercase shadow-lg shadow-orange-100 hover:bg-[#E04D25] transition-all">
                                REGISTER INTEREST
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3 mt-24 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <Calendar size={22} />
                    </div>
                    <h2 className="text-[24px] md:text-[28px] font-[900] text-[#1E293B]">Past Events</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {past.map((event, i) => (
                        <div key={i} className="bg-white p-6 rounded-[20px] border border-slate-50 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
                            <div className={`w-14 h-14 rounded-2xl ${event.iconBg} flex items-center justify-center text-white shrink-0 shadow-lg group-hover:rotate-12 transition-transform`}>
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-1">{event.tag}</p>
                                <h3 className="text-[17px] font-black text-[#1E293B] mb-0.5">{event.title}</h3>
                                <p className="text-[13px] font-medium text-slate-500">{event.date} • {event.venue}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <AdmissionBanner />
            <Footer />
        </div>
    );
};

export default EventsPage;
