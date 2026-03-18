import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdmissionBanner, Footer } from '../components/Footer';

const FAQPage = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            q: "What is the age criteria for admission?",
            a: "For Playgroup, the child should be 2+ years. For Nursery, 3+ years. For LKG and UKG, the age should be 4+ and 5+ years respectively by March 31st of the academic year."
        },
        {
            q: "When does the academic session start?",
            a: "Our regular academic session begins in April each year and continues until March of the following year."
        },
        {
            q: "What are the school timings?",
            a: "Playgroup & Nursery: 9:00 AM to 12:30 PM. Kindergarten to Class 5: 8:00 AM to 2:00 PM. We have a Saturday half-day for all classes."
        },
        {
            q: "Do you provide transport facility?",
            a: "Yes, we provide safe and secure van transport for students within a 10km radius of the school campus. All vans have GPS tracking and dedicated caretakers."
        },
        {
            q: "What curriculum do you follow?",
            a: "We follow a child-centric, activity-based curriculum aligned with CBSE guidelines, focusing on holistic development through practical learning and creative expression."
        },
        {
            q: "Is there a uniform for students?",
            a: "Yes, we have a specific uniform for each grade level, providing a sense of identity and discipline. Uniform details are shared during the admission process."
        },
        {
            q: "How can parents track their child's progress?",
            a: "Parents can use our dedicated mobile app to track attendance, homework, exam results, and daily school activities. We also conduct regular Parent-Teacher Meetings."
        },
        {
            q: "Are there any extracurricular activities?",
            a: "Absolutely! We offer music, dance, yoga, sports, and art & craft as part of our regular curriculum to ensure the over-all creative growth of every child."
        },
        {
            q: "How do I apply for admission?",
            a: "You can apply by visiting the school office and collecting the admission form, or by clicking the 'Apply Now' button on our website to fill interest form."
        },
        {
            q: "What safety measures are in place?",
            a: "The entire campus is under 24/7 CCTV surveillance. We have secure entry/exit points, fire safety equipment, and trained staff to handle emergencies and ensure child safety."
        }
    ];

    return (
        <div className="w-full bg-white font-['Outfit',_sans-serif]">
            <PageHeader 
                subtitle="Have Questions?"
                title={<>Frequently Asked <span className="text-[#FBBF24]">Questions</span></>}
                description="Find answers to the most common questions about Little Seeds School."
            />

            <section className="py-12 px-6 md:px-20 max-w-4xl mx-auto">
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div 
                            key={i} 
                            className={`rounded-[16px] overflow-hidden border transition-all duration-300 ${openIndex === i ? 'border-[#FF5A2D] bg-white shadow-lg' : 'border-slate-100 bg-[#FBFBFE]'}`}
                        >
                            <button 
                                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                            >
                                <span className={`text-[16px] font-black tracking-tight ${openIndex === i ? 'text-[#FF5A2D]' : 'text-[#1E293B]'}`}>
                                    {faq.q}
                                </span>
                                <ChevronDown 
                                    size={22} 
                                    className={`shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-[#FF5A2D]' : 'text-slate-400'}`} 
                                />
                            </button>
                            
                            <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-8 pb-8 text-[15px] md:text-[16px] font-medium leading-[1.8] text-slate-500">
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA Card */}
                <div className="mt-20 bg-[#FFF9F1] rounded-[30px] p-10 text-center flex flex-col items-center">
                    <h2 className="text-[28px] md:text-[34px] font-[900] text-[#1E293B] mb-2">Still have questions?</h2>
                    <p className="text-[15px] font-medium text-slate-500 mb-8 max-w-[400px]">
                        Our team is always happy to help. Reach out to us directly!
                    </p>
                    <button 
                        onClick={() => navigate('/contact')}
                        className="bg-[#FF5A2D] text-white px-10 py-4 rounded-[4px] font-black text-[13px] tracking-widest uppercase shadow-xl hover:bg-[#E04D25] hover:-translate-y-1 transition-all flex items-center gap-2"
                    >
                        CONTACT US <MessageCircle size={18} />
                    </button>
                </div>
            </section>

            <AdmissionBanner />
            <Footer />
        </div>
    );
};

export default FAQPage;
