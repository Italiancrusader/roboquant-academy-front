import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-charcoal/90 backdrop-blur-md py-3' : 'py-4 sm:py-6'}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/4c216359-4b16-4bab-96e9-d1add3ebb2c8.png" 
            alt="RoboQuant Academy" 
            className="h-8 sm:h-10"
          />
        </div>

        {isMobile ? (
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/10" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-white-primary hover:gradient-text transition-all">Features</a>
              <a href="#benefits" className="text-white-primary hover:gradient-text transition-all">Benefits</a>
              <a href="#curriculum" className="text-white-primary hover:gradient-text transition-all">Curriculum</a>
              <a href="#testimonials" className="text-white-primary hover:gradient-text transition-all">Testimonials</a>
              <a href="#pricing" className="text-white-primary hover:gradient-text transition-all">Pricing</a>
            </div>
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
              Enroll Now
            </Button>
          </>
        )}

        {isMobile && isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-charcoal/95 backdrop-blur-md py-4 border-t border-white/10 animate-fade-in">
            <div className="container mx-auto px-4 flex flex-col space-y-4">
              <a href="#features" className="text-white-primary hover:gradient-text transition-all py-2">Features</a>
              <a href="#benefits" className="text-white-primary hover:gradient-text transition-all py-2">Benefits</a>
              <a href="#curriculum" className="text-white-primary hover:gradient-text transition-all py-2">Curriculum</a>
              <a href="#testimonials" className="text-white-primary hover:gradient-text transition-all py-2">Testimonials</a>
              <a href="#pricing" className="text-white-primary hover:gradient-text transition-all py-2">Pricing</a>
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity w-full">
                Enroll Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
