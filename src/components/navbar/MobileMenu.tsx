
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  description: string;
}

interface MobileMenuProps {
  navItems: NavItem[];
  user: any | null;
  isScrolled: boolean;
  onSignOut: () => Promise<void>;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ 
  navItems, 
  user, 
  isScrolled,
  onSignOut
}) => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden" asChild>
        <Button 
          variant="ghost" 
          className={cn("p-0", isScrolled ? "" : "text-white hover:bg-white/20")}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Explore the RoboQuant Academy
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4">
          {navItems.map((item) => (
            <Button asChild variant="ghost" className="justify-start" key={item.href}>
              <Link to={item.href}>{item.title}</Link>
            </Button>
          ))}
          {!user && (
            <Button 
              variant="default" 
              className="justify-start cta-button"
              onClick={() => window.open('https://whop.com/checkout/plan_h6SjTvT4JxgxA/', '_blank')}
            >
              Enroll Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {user ? (
            <>
              <Button asChild variant="ghost" className="justify-start">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start">
                <Link to="/profile">Profile</Link>
              </Button>
              <Button variant="ghost" className="justify-start" onClick={onSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" className="justify-start">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
