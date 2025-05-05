import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import WhyRoboQuant from '../components/WhyRoboQuant';
import CourseOutcomes from '../components/CourseOutcomes';
import Curriculum from '../components/Curriculum';
import CostCalculator from '../components/CostCalculator';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import AboutInstructor from '../components/AboutInstructor';
import CTA from '../components/CTA';
import { Link } from "react-router-dom";
import { Instagram, Send } from 'lucide-react';
import { trackPageView, trackViewContent } from '../utils/metaPixel';
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Track page view again when component mounts (SPA navigation)
    trackPageView();
    
    // Track ViewContent event for homepage
    trackViewContent(
      'RoboQuant Academy Homepage',
      'Landing Page'
    );
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: 'RoboQuant Academy Home',
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground font-neulis overflow-x-hidden">
      <Navbar />
      <Hero />
      <WhyRoboQuant />
      <CourseOutcomes />
      <Curriculum />
      <CostCalculator />
      <Testimonials />
      <section id="pricing">
        <Pricing />
      </section>
      <FAQ />
      <AboutInstructor />
      <CTA />
      
      <footer className="py-8 px-4 border-t border-gray-800 bg-secondary">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-xl font-bold gradient-text">RoboQuant Academy</h1>
              <p className="text-sm text-gray-400">Build Trading Bots Without Code</p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
              <Link to="/mt5-report-genie" className="text-sm text-gray-400 hover:text-blue-primary">MT5 Report Genie</Link>
              <Link to="/privacy-policy" className="text-sm text-gray-400 hover:text-blue-primary">Privacy Policy</Link>
              <Link to="/terms-of-service" className="text-sm text-gray-400 hover:text-blue-primary">Terms of Service</Link>
              <Link to="/contact" className="text-sm text-gray-400 hover:text-blue-primary">Contact Us</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} RoboQuant Academy. All rights reserved.
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a 
                href="https://discord.gg/7sU4DmvmpW" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-blue-primary" 
                aria-label="Discord"
              >
                <img 
                  src="/lovable-uploads/966ee0cf-2ede-4285-959d-bcf325b244bb.png" 
                  alt="Discord" 
                  className="w-5 h-5" 
                />
              </a>
              <a 
                href="https://www.instagram.com/timhutter.official/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-blue-primary" 
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://t.me/tradepiloteabot" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-blue-primary" 
                aria-label="Telegram"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
