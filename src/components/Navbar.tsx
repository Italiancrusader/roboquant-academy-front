
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, ArrowRight, User, LogOut, Book, BookOpen } from 'lucide-react';
import { Link } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const menuItems = [{
    name: "Why RoboQuant",
    href: "/#why"
  }, {
    name: "Outcomes",
    href: "/#outcomes"
  }, {
    name: "Curriculum",
    href: "/#curriculum"
  }, {
    name: "Testimonials",
    href: "/#testimonials"
  }, {
    name: "Pricing",
    href: "/#pricing"
  }, {
    name: "FAQ",
    href: "/#faq"
  }, {
    name: "Courses",
    href: "/courses"
  }];

  const userMenuItems = [{
    name: "Dashboard",
    href: "/dashboard",
    icon: <BookOpen className="h-4 w-4 mr-2" />
  }, {
    name: "Profile",
    href: "/profile",
    icon: <User className="h-4 w-4 mr-2" />
  }];
  
  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md shadow-md py-2' : 'py-4 sm:py-6'}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <img 
              alt="RoboQuant Academy" 
              className="h-10 sm:h-12 object-contain" 
              src="/lovable-uploads/75ec0136-6eac-4af5-a2ef-798104dbc59a.png" 
            />
          </Link>
        </div>

        {isMobile ? 
          <div className="flex items-center gap-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  {userMenuItems.map(item => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link to={item.href} className="flex items-center cursor-pointer">
                        {item.icon}
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer text-red-500" 
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-foreground hover:bg-accent" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div> 
        : 
          <>
            <div className="hidden md:flex space-x-6">
              {menuItems.map(item => 
                item.href.startsWith('/') ? (
                  <Link 
                    key={item.name} 
                    to={item.href} 
                    className="text-foreground/80 hover:text-foreground hover:gradient-text transition-all py-1 px-2"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a 
                    key={item.name} 
                    href={item.href} 
                    className="text-foreground/80 hover:text-foreground hover:gradient-text transition-all py-1 px-2"
                  >
                    {item.name}
                  </a>
                )
              )}
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      My Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user.email}
                    </div>
                    <DropdownMenuSeparator />
                    {userMenuItems.map(item => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link to={item.href} className="flex items-center cursor-pointer">
                          {item.icon}
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="flex items-center cursor-pointer text-red-500" 
                      onClick={() => signOut()}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
              <Button asChild className="cta-button text-white">
                <Link to="/courses">
                  Browse Courses <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        }

        {isMobile && isMenuOpen && 
          <div className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-md shadow-lg py-4 animate-fade-in">
            <div className="container mx-auto px-4 flex flex-col space-y-4">
              {menuItems.map(item => 
                item.href.startsWith('/') ? (
                  <Link 
                    key={item.name} 
                    to={item.href} 
                    className="text-foreground/80 hover:text-foreground hover:gradient-text transition-all py-2" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a 
                    key={item.name} 
                    href={item.href} 
                    className="text-foreground/80 hover:text-foreground hover:gradient-text transition-all py-2" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                )
              )}
              {!user && (
                <Button asChild className="w-full" variant="outline">
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              )}
              <Button asChild className="cta-button text-white w-full">
                <Link to="/courses" onClick={() => setIsMenuOpen(false)}>
                  Browse Courses <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        }
      </div>
    </nav>
  );
};

export default Navbar;
