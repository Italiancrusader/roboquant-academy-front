
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { trackInitiateCheckout } from "@/utils/metaPixel";
import { handleStripeCheckout } from "@/services/stripe";

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
  showAuthButtons?: boolean;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ 
  navItems, 
  user, 
  isScrolled,
  onSignOut,
  showAuthButtons = true
}) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEnroll = async () => {
    setIsLoading(true);
    
    // Close sheet
    const sheetClose = document.querySelector('[data-radix-sheet-close]');
    if (sheetClose instanceof HTMLElement) {
      sheetClose.click();
    }
    
    try {
      // Track InitiateCheckout event
      trackInitiateCheckout({
        value: 1500,
        currency: 'USD',
        content_name: 'RoboQuant Academy',
        content_type: 'product'
      });
      
      // Process checkout with Stripe
      const userId = user ? user.id : undefined;
      await handleStripeCheckout({
        courseId: 'roboquant-academy',
        courseTitle: 'RoboQuant Academy',
        price: 1500,
        userId: userId,
        successUrl: window.location.origin + '/dashboard',
        cancelUrl: window.location.origin + location.pathname,
      });
    } catch (error) {
      console.error("Error during checkout:", error);
      setIsLoading(false);
    }
  };
  
  return (
    <>
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
            
            {/* Always show EnrollButton */}
            <Button 
              variant="default" 
              className="justify-start cta-button"
              onClick={handleEnroll}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Join the Academy Now <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            
            {/* Only show auth buttons if showAuthButtons is true */}
            {showAuthButtons && user ? (
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
            ) : showAuthButtons && !user && (
              <Button asChild variant="ghost" className="justify-start">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
