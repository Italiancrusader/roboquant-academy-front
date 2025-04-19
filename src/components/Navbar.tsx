
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, ArrowRight, Moon, Sun } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();

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
      scrolled ? 'bg-white dark:bg-charcoal shadow-md py-2' : 'py-4 sm:py-6'
    }`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/b3b1dadc-ed0c-42df-adde-6a3707f08171.png" 
            alt="RoboQuant Academy" 
            className="h-8 sm:h-20"
          />
        </div>

        {isMobile ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 dark:hidden" />
              <Switch 
                checked={theme === 'dark'}
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
              <Moon className="h-4 w-4 hidden dark:block" />
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-robo-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800" 
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
                  className="text-robo-dark dark:text-white hover:gradient-text transition-all l-bracket-accent py-1 px-2"
                >
                  {item.name}
                </a>
              ))}
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 dark:hidden" />
                <Switch 
                  checked={theme === 'dark'}
                  onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                />
                <Moon className="h-4 w-4 hidden dark:block" />
              </div>
            </div>
            <Button className="cta-button text-white">
              Enroll Now <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </>
        )}

        {isMobile && isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white dark:bg-charcoal shadow-lg py-4 animate-fade-in">
            <div className="container mx-auto px-4 flex flex-col space-y-4">
              {menuItems.map((item) => (
                <a 
                  key={item.name}
                  href={item.href} 
                  className="text-robo-dark dark:text-white hover:gradient-text transition-all py-2"
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
