
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import WhyRoboQuant from '../components/WhyRoboQuant';
import RealResults from '../components/RealResults';
import CourseOutcomes from '../components/CourseOutcomes';
import Curriculum from '../components/Curriculum';
import CostCalculator from '../components/CostCalculator';
import Testimonials from '../components/Testimonials';
import PricingSection from '../components/PricingSection';
import FAQ from '../components/FAQ';
import AboutInstructor from '../components/AboutInstructor';
import CTA from '../components/CTA';
import { Link, useNavigate } from "react-router-dom";
import { Instagram, Send } from 'lucide-react';
import { trackPageView } from '../utils/googleAnalytics';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Track page view with both Google Analytics and gtag
    trackPageView(window.location.pathname, 'RoboQuant Academy Home');

    // Check for query parameters to show quiz directly
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('apply') === 'true') {
      navigate('/quiz');
    }
  }, [navigate]);
  
  return <div className="min-h-screen bg-background text-foreground font-neulis overflow-x-hidden">
      <Navbar />
      <Hero />
      <WhyRoboQuant />
      <RealResults />
      <CourseOutcomes />
      <Curriculum />
      <CostCalculator />
      <Testimonials />
      <PricingSection />
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
              <a href="https://discord.gg/7sU4DmvmpW" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-primary" aria-label="Discord">
                <img src="/lovable-uploads/966ee0cf-2ede-4285-959d-bcf325b244bb.png" alt="Discord" className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/timhutter.official/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-primary" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://t.me/tradepiloteabot" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-primary" aria-label="Telegram">
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};

export default Index;
