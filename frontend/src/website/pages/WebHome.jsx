import React from 'react';
import HeroSlider from '../components/HeroSlider';
import WhyChooseUs from '../components/WhyChooseUs';
import AboutSection from '../components/AboutSection';
import ProgramsSection from '../components/ProgramsSection';
import StatsSection from '../components/StatsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import { AdmissionBanner, Footer } from '../components/Footer';

const WebHome = () => {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <HeroSlider />
      
      {/* Features / Why Choose Us Section */}
      <WhyChooseUs />
      
      {/* About Section */}
      <AboutSection />
      
      {/* Programs Section */}
      <ProgramsSection />
      
      {/* Stats Counter Section */}
      <StatsSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* Admissions Banner */}
      <AdmissionBanner />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default WebHome;
