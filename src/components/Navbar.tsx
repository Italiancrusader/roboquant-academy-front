
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-charcoal/90 backdrop-blur-md py-4' : 'py-6'}`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-[1.75rem] font-bold gradient-text">RoboQuant Academy</h1>
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#features" className="text-white-primary hover:gradient-text transition-all">Features</a>
          <a href="#benefits" className="text-white-primary hover:gradient-text transition-all">Benefits</a>
          <a href="#curriculum" className="text-white-primary hover:gradient-text transition-all">Curriculum</a>
          <a href="#testimonials" className="text-white-primary hover:gradient-text transition-all">Testimonials</a>
          <a href="#pricing" className="text-white-primary hover:gradient-text transition-all">Pricing</a>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">Enroll Now</Button>
      </div>
    </nav>
  );
};

export default Navbar;
