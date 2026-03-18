import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { Camera, ArrowRight, X } from 'lucide-react';
import { AdmissionBanner, Footer } from '../components/Footer';
import g1 from '../../assets/image.png';
import g2 from '../../assets/image2.png';
import g3 from '../../assets/image3.png';
import g4 from '../../assets/image4.png';
import g5 from '../../assets/image5.png';
import g6 from '../../assets/image6.png';
import g7 from '../../assets/image7.png';
import g8 from '../../assets/image8.png';

const GalleryPage = () => {
    const images = [g1, g2, g3, g4, g5, g6, g7, g8, g1, g2, g3, g4];
    const [selectedImg, setSelectedImg] = useState(null);

    return (
        <div className="w-full bg-white font-['Outfit',_sans-serif]">
            <PageHeader 
                subtitle="Our Memories"
                title={<>School <span className="text-[#FBBF24]">Gallery</span></>}
                description="A glimpse into the joyful, colorful world of Little Seeds School."
            />

            <section className="py-12 px-6 md:px-20 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-10 justify-center">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-[#3B82F6]">
                        <Camera size={20} />
                    </div>
                    <h2 className="text-[26px] md:text-[34px] font-[900] text-[#1E293B]">Moments at Little Seeds</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {images.map((img, i) => (
                        <div 
                            key={i} 
                            onClick={() => setSelectedImg(img)}
                            className="group relative aspect-[4/3] rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                        >
                            <img 
                                src={img} 
                                alt={`Gallery ${i}`} 
                                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/400'; }}
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-white/90 text-[#1E293B] px-4 py-2 rounded-full text-[12px] font-black uppercase tracking-widest shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    View Full
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA Card - Smaller */}
                <div className="mt-16 py-12 px-6 bg-[#FFF9F1] rounded-[30px] text-center flex flex-col items-center relative overflow-hidden group">
                    <h2 className="text-[28px] md:text-[34px] font-[900] text-[#1E293B] mb-2 relative z-10">Want to visit us?</h2>
                    <button className="bg-[#FF5A2D] text-white px-8 py-3.5 rounded-[4px] font-black text-[12px] tracking-widest uppercase shadow-xl hover:bg-[#E04D25] transition-all flex items-center gap-2 relative z-10">
                        BOOK A VISIT <ArrowRight size={16} />
                    </button>
                </div>
            </section>

            {/* Lightbox / Modal */}
            {selectedImg && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <button 
                        onClick={() => setSelectedImg(null)}
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
                    >
                        <X size={40} />
                    </button>
                    <img 
                        src={selectedImg} 
                        alt="Original" 
                        className="max-w-full max-h-full rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                    />
                </div>
            )}

            <AdmissionBanner />
            <Footer />
        </div>
    );
};

export default GalleryPage;
