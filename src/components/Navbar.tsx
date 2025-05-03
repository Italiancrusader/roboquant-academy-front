
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./navbar/UserMenu";
import { NavLogo } from "./navbar/NavLogo";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { EnrollButton } from "./navbar/EnrollButton";
import { MobileMenu } from "./navbar/MobileMenu";

const AuthButtons = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  if (user) {
    return <UserMenu user={user} onSignOut={handleSignOut} isScrolled={false} />;
  }

  return (
    <div className="hidden md:flex items-center space-x-4">
      <Link to="/auth" state={{ redirect: location.pathname }}>
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </Link>
      {/* Removed the duplicate "Get Started" button here */}
    </div>
  );
};

const MobileAuthButton = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Don't render the sign-up button if user is logged in
  if (user) {
    return null;
  }

  return (
    <div className="md:hidden flex">
      <Link to="/auth" state={{ redirect: location.pathname }}>
        <Button size="sm" className="cta-button">
          Sign Up
        </Button>
      </Link>
    </div>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // NavItems for mobile menu
  const navItems = [
    {
      title: "Home",
      href: "/",
      description: "Return to the homepage"
    },
    {
      title: "Courses",
      href: "/courses",
      description: "Browse our courses"
    },
    {
      title: "Community",
      href: "/community",
      description: "Join our community"
    },
    {
      title: "Contact",
      href: "/contact",
      description: "Get in touch with us"
    }
  ];

  // Create a signOut handler function
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-50 transition-colors duration-300",
      isScrolled ? "bg-secondary/90 backdrop-blur-sm border-b border-border" : "bg-transparent",
    )}>
      <div className="container max-w-screen-xl mx-auto py-3 px-4">
        <div className="flex items-center justify-between">
          <NavLogo isScrolled={isScrolled} />
          
          <div className="flex items-center space-x-4">
            {/* Desktop: Enroll Button */}
            <EnrollButton isScrolled={isScrolled} />
            
            {/* Desktop: Auth buttons or user menu */}
            <AuthButtons />
            
            {/* Mobile: Sign Up button (only shown when not logged in) */}
            <MobileAuthButton />

            {/* Mobile menu */}
            <MobileMenu 
              navItems={navItems}
              user={user}
              isScrolled={isScrolled}
              onSignOut={handleSignOut}
              showAuthButtons={true}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
