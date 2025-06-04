
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import WhyRoboQuant from '@/components/WhyRoboQuant';
import RealResults from '@/components/RealResults';
import AboutInstructor from '@/components/AboutInstructor';
import Testimonials from '@/components/Testimonials';
import Curriculum from '@/components/Curriculum';
import PricingSection from '@/components/PricingSection';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import { trackViewContent } from '@/utils/metaPixel';

const Index = () => {
  useEffect(() => {
    // Track ViewContent event for main landing page
    trackViewContent({
      content_name: 'RoboQuant Academy Landing Page',
      content_category: 'education',
      content_type: 'landing_page'
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <WhyRoboQuant />
      <RealResults />
      <AboutInstructor />
      <Testimonials />
      <Curriculum />
      <PricingSection />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
