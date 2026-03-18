import React from 'react';
import PageHeader from '../components/PageHeader';
import { MapPin, Mail, Clock, Send } from 'lucide-react';
import { AdmissionBanner, Footer } from '../components/Footer';

const ContactPage = () => {
    return (
        <div className="w-full bg-white font-['Outfit',_sans-serif]">
            <PageHeader 
                subtitle="Get In Touch"
                title={<>Contact <span className="text-[#FBBF24]">Us</span></>}
                description="We'd love to hear from you. Reach out for admissions, queries or a school visit."
            />

            <section className="py-12 px-6 md:px-20 max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                    
                    {/* Left Side: Contact Info Cards */}
                    <div className="w-full lg:w-[35%] space-y-6">
                        <h2 className="text-[26px] md:text-[32px] font-[900] text-[#1E293B] mb-6">Find Us Here</h2>
                        
                        {/* Address Card */}
                        <div className="bg-[#FFF9F1] p-5 rounded-[18px] flex items-start gap-4 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-[#FF5A2D] flex items-center justify-center text-white shrink-0">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <h3 className="text-[16px] font-black text-[#1E293B] mb-0.5">Our Address</h3>
                                <p className="text-[13px] font-medium text-slate-500 leading-relaxed">
                                    Near PVS Banka,<br />Banka - Bihar 813102
                                </p>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="bg-[#F0F7FF] p-5 rounded-[18px] flex items-start gap-4 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white shrink-0">
                                <Mail size={18} />
                            </div>
                            <div>
                                <h3 className="text-[16px] font-black text-[#1E293B] mb-0.5">Email Address</h3>
                                <p className="text-[13px] font-medium text-slate-500">
                                    info@littleseeds.org.in
                                </p>
                            </div>
                        </div>

                        {/* Hours Card */}
                        <div className="bg-[#FFFDF1] p-5 rounded-[18px] flex items-start gap-4 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-[#FBBF24] flex items-center justify-center text-white shrink-0">
                                <Clock size={18} />
                            </div>
                            <div>
                                <h3 className="text-[16px] font-black text-[#1E293B] mb-0.5">School Hours</h3>
                                <p className="text-[13px] font-medium text-slate-500">
                                    Mon to Sat: 8:00 AM – 2:30 PM
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Message Form - Compact */}
                    <div className="w-full lg:w-[65%]">
                        <h2 className="text-[26px] md:text-[32px] font-[900] text-[#1E293B] mb-6">Send a Message</h2>
                        
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Your Name *</label>
                                <input type="text" placeholder="e.g. Rajesh Kumar" className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-100 outline-none focus:border-[#FF5A2D] text-[14px] font-medium" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Phone Number</label>
                                <input type="text" placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-100 outline-none focus:border-[#FF5A2D] text-[14px] font-medium" />
                            </div>

                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Email Address *</label>
                                <input type="email" placeholder="your@email.com" className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-100 outline-none focus:border-[#FF5A2D] text-[14px] font-medium" />
                            </div>

                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Message *</label>
                                <textarea rows="3" placeholder="Write your message here..." className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-100 outline-none focus:border-[#FF5A2D] text-[14px] font-medium resize-none"></textarea>
                            </div>

                            <div className="md:col-span-2 pt-2">
                                <button className="w-max bg-[#FF5A2D] text-white px-10 py-3.5 rounded-[4px] font-black text-[12px] tracking-widest uppercase flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 transition-all">
                                    SEND MESSAGE <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Real Map Section */}
            <div className="w-full h-[350px] bg-slate-100 relative grayscale-[0.5] hover:grayscale-0 transition-all duration-700">
                <iframe 
                    title="Little Seeds School Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14451.90562854359!2d86.914563!3d24.887254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDUzJzE0LjEiTiA4NsKwNTQnNTIuNCJF!5e0!3m2!1sen!2sin!4v1710777000000!5m2!1sen!2sin" 
                    className="w-full h-full border-0"
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>

            <AdmissionBanner />
            <Footer />
        </div>
    );
};

export default ContactPage;
