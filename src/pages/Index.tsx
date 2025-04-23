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

const Index = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: 'RoboQuant Academy Home',
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-segoe overflow-x-hidden">
      <Navbar />
      <Hero />
      <WhyRoboQuant />
      <CourseOutcomes />
      <Curriculum />
      <CostCalculator />
      <Testimonials />
      <Pricing />
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
              <a href="#" className="text-sm text-gray-400 hover:text-blue-primary">Contact Us</a>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M15 12.5a1 1 0 1 0 2 0 1 1 0 1 0-2 0zM9 12.5a1 1 0 1 0 2 0 1 1 0 1 0-2 0z"/>
                  <path d="M12.125 3c.53 0 1.045.04 1.533.12a9 9 0 0 1 8.242 9.777 9 9 0 0 1-3.899 6.713l-1.58 1.58a.5.5 0 0 1-.854-.353v-3.058a9 9 0 0 1-8.47-14.95l.14-.14a9 9 0 0 1 4.88-2.69zm-1.687 2.8a7 7 0 0 0 10.562 8.962.5.5 0 0 1 .565-.077l1 .5a7 7 0 1 1-8.54-9.79l.014-.595z"/>
                </svg>
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
