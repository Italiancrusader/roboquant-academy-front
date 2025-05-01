
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavLogo } from "@/components/navbar/NavLogo";
import { UserMenu } from "@/components/navbar/UserMenu";
import { MobileMenu } from "@/components/navbar/MobileMenu";
import { EnrollButton } from "@/components/navbar/EnrollButton";
import { navItems } from "@/components/navbar/NavItems";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      console.error("Sign out failed:", error.message);
    }
  };

  return (
    <header className={cn(isScrolled ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm" : "bg-transparent text-white", "fixed top-0 w-full z-40 transition-all")}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <NavLogo isScrolled={isScrolled} />
          </div>

          <div className="flex items-center space-x-4">
            {/* Enroll Now button - only show when not signed in */}
            {!user && <EnrollButton isScrolled={isScrolled} />}
            
            {user ? (
              <UserMenu 
                user={user} 
                isScrolled={isScrolled} 
                onSignOut={handleSignOut} 
              />
            ) : (
              <Button 
                asChild
                variant={isScrolled ? "default" : "outline"} 
                className={!isScrolled ? "text-white border-white hover:text-white hover:bg-white/20" : ""}
              >
                <Link to="/auth">Sign In</Link>
              </Button>
            )}

            <MobileMenu 
              navItems={navItems} 
              user={user} 
              isScrolled={isScrolled}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
