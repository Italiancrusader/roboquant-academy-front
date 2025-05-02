import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./navbar/UserMenu";
import { cn } from "@/lib/utils";

const NavItems = [
  { label: "Courses", href: "/courses" },
  { label: "MT5 Report Genie", href: "/mt5-report-genie" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Community", href: "/community" }
];

const Logo = () => (
  <Link to="/" className="flex items-center font-bold text-xl md:text-2xl gradient-text">
    RoboQuant Academy
  </Link>
);

const DesktopNav = () => (
  <div className="hidden md:flex items-center space-x-6">
    {NavItems.map((item) => (
      <Link key={item.href} to={item.href} className="text-sm hover:text-primary transition-colors duration-200">
        {item.label}
      </Link>
    ))}
  </div>
);

const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden p-2">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-secondary text-foreground">
        <SheetHeader>
          <SheetTitle>RoboQuant Academy</SheetTitle>
          <SheetDescription>
            Navigate through our platform.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          {NavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="block py-2 px-4 text-sm hover:bg-muted rounded-md transition-colors duration-200"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

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
      <Link to="/auth" state={{ redirect: location.pathname }}>
        <Button size="sm" className="cta-button">
          Get Started
        </Button>
      </Link>
    </div>
  );
};

const MobileAuthButtons = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  if (user) {
    return null;
  }

  return (
    <div className="md:hidden flex flex-col items-center space-y-4">
      <Link to="/auth" state={{ redirect: location.pathname }}>
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </Link>
      <Link to="/auth" state={{ redirect: location.pathname }}>
        <Button size="sm" className="cta-button">
          Get Started
        </Button>
      </Link>
    </div>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <Logo />
          <DesktopNav />
          <AuthButtons />
          <MobileNav />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
