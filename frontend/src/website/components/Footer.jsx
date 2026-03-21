import React from 'react';
import { Twitter, Facebook, Instagram, Youtube, MapPin, Mail, Phone, Clock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import footerLogo from '../../assets/logo.jpeg';

export const AdmissionBanner = () => {
    return (
        <section className="bg-[#FF5A2D] py-8 px-10 relative overflow-hidden font-['Outfit',_sans-serif]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="text-white text-center md:text-left">
                    <h2 className="text-[32px] md:text-[38px] font-[900] leading-none mb-2">
                        Admissions Open 2026-27!
                    </h2>
                    <p className="text-[12px] md:text-[14px] font-black tracking-[0.2em] uppercase opacity-90">
                        LIMITED SEATS AVAILABLE. APPLY NOW!
                    </p>
                </div>
                
                <button className="bg-[#091E3E] text-white px-10 py-4 rounded-[4px] font-black text-[13px] tracking-widest uppercase hover:bg-[#0C2A54] transition-all shadow-xl hover:-translate-y-1">
                    APPLY NOW
                </button>
            </div>
            
            {/* Background pattern circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </section>
    );
};

export const Footer = () => {
    return (
        <footer className="bg-[#091E3E] pt-10 pb-6 px-10 text-white font-['Outfit',_sans-serif] relative z-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
                
                {/* School Info */}
                <div className="space-y-4">
                    <img 
                        src={footerLogo} 
                        alt="Little Seeds" 
                        className="h-14 brightness-110 grayscale-[0.2] hover:grayscale-0 transition-all rounded-[8px] border-4 border-white/10 p-1 bg-white" 
                    />
                    <p className="text-[13px] md:text-[14px] font-medium text-slate-400 leading-relaxed max-w-[280px]">
                        Building bright futures since 2015 — one little seed at a time. Playgroup to Class 5.
                    </p>
                    <div className="flex space-x-2 mt-4">
                        {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                            <div key={i} className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#FF5A2D] transition-colors flex items-center justify-center cursor-pointer group shadow-sm">
                                <Icon size={14} className="text-white/80 group-hover:text-white" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                    <h3 className="text-[15px] font-black tracking-widest uppercase text-white/95">Quick Links</h3>
                    <ul className="space-y-2 text-[13px] md:text-[14px] font-medium text-slate-400">
                        {[
                            { label: 'Home', path: '/' },
                            { label: 'About Us', path: '/' },
                            { label: 'Programs', path: '/programs' },
                            { label: 'Gallery', path: '/gallery' },
                            { label: 'Contact', path: '/contact' }
                        ].map(link => (
                            <li key={link.label} className="hover:text-[#FF5A2D] cursor-pointer transition-colors w-max">
                                <Link to={link.path}>{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Programs */}
                <div className="space-y-4">
                    <h3 className="text-[15px] font-black tracking-widest uppercase text-white/95">Programs</h3>
                    <ul className="space-y-2 text-[13px] md:text-[14px] font-medium text-slate-400">
                        {['Play Group', 'Nursery', 'LKG & UKG', 'Class 1-3', 'Class 4-5'].map(link => (
                            <li key={link} className="hover:text-[#FF5A2D] cursor-pointer transition-colors w-max">
                                <Link to="/programs">{link}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact Us */}
                <div className="space-y-4">
                    <h3 className="text-[15px] font-black tracking-widest uppercase text-white/95">Contact Us</h3>
                    <ul className="space-y-4 text-[13px] md:text-[14px] font-medium text-slate-400">
                        <li className="flex items-start space-x-3">
                            <MapPin size={16} className="text-[#FF5A2D] mt-0.5 shrink-0" />
                            <span>Near PVS Banka, Bihar - 813102</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <Mail size={16} className="text-[#FF5A2D] shrink-0" />
                            <span>info@littleseeds.org.in</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <Clock size={16} className="text-[#FF5A2D] shrink-0" />
                            <span>Mon-Sat: 8:00 AM – 2:30 PM</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Copyright Area */}
            <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[11px] font-black tracking-wider text-slate-500 uppercase">
                <p>© 2026 LITTLE SEEDS SCHOOL. ALL RIGHTS RESERVED.</p>

            </div>
        </footer>
    );
};
