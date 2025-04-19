
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, ArrowRight } from 'lucide-react';

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

  const menuItems = [
    { name: "Why RoboQuant", href: "#why" },
    { name: "Outcomes", href: "#outcomes" },
    { name: "Curriculum", href: "#curriculum" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" }
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md py-2' : 'py-4 sm:py-6'
    }`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/1c61b595-e702-4709-ac92-9c8743241f37.png" 
            alt="RoboQuant Academy" 
            className="h-10 sm:h-12 object-contain"
          />
        </div>

        {isMobile ? (
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-robo-dark hover:bg-gray-100" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden md:flex space-x-8">
              {menuItems.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href} 
                  className="text-robo-dark hover:gradient-text transition-all l-bracket-accent py-1 px-2"
                >
                  {item.name}
                </a>
              ))}
            </div>
            <Button className="cta-button text-white">
              Enroll Now <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </>
        )}

        {isMobile && isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg py-4 animate-fade-in">
            <div className="container mx-auto px-4 flex flex-col space-y-4">
              {menuItems.map((item) => (
                <a 
                  key={item.name}
                  href={item.href} 
                  className="text-robo-dark hover:gradient-text transition-all py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <Button className="cta-button text-white w-full">
                Enroll Now <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
