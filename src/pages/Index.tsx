
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Benefits from '../components/Benefits';
import Curriculum from '../components/Curriculum';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import CTA from '../components/CTA';

const Index = () => {
  return (
    <div className="min-h-screen bg-charcoal text-white-primary overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <Benefits />
      <Curriculum />
      <Testimonials />
      <Pricing />
      <CTA />
      
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-xl font-bold gradient-text">RoboQuant Academy</h1>
              <p className="text-sm text-white-primary/60">Elevating Quantitative Trading Education</p>
            </div>
            <div className="text-sm text-white-primary/60">
              &copy; {new Date().getFullYear()} RoboQuant Academy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
