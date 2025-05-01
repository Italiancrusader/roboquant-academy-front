import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User, Settings, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  title: string;
  href: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    title: "Courses",
    href: "/courses",
    description: "Explore our wide range of courses.",
  },
  {
    title: "MT5 Report Genie",
    href: "/mt5-report-genie",
    description: "Generate detailed MT5 trading reports effortlessly.",
  },
  {
    title: "Privacy Policy",
    href: "/privacy-policy",
    description: "Read our privacy policy.",
  },
  {
    title: "Terms of Service",
    href: "/terms-of-service",
    description: "View our terms of service.",
  },
];

const getInitials = (user: any) => {
  if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
    return `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`.toUpperCase();
  }
  return "?";
};

const getUserDisplayName = (user: any) => {
  if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
    return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
  }
  return user.email;
};

// Inside the Navbar component
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
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className={cn("text-lg font-bold", isScrolled ? "text-primary" : "text-white")}>
                RoboQuant Academy
              </span>
            </Link>
            <nav className="ml-8 hidden md:flex space-x-4 items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {navItems.map((item) => (
                    <NavigationMenuItem key={item.href}>
                      <NavigationMenuTrigger>
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <NavigationMenuLink>
                          {item.description}
                        </NavigationMenuLink>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={cn("p-0 h-8 w-8 rounded-full", isScrolled ? "text-primary hover:bg-muted" : "text-white hover:bg-primary/20")}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
                      <AvatarFallback>{getInitials(user)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getUserDisplayName(user)}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* Admin link - will check if user has admin role */}
                    <AdminLink />
                    
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                asChild
                variant={isScrolled ? "default" : "outline"} 
                className={!isScrolled ? "text-white border-white hover:text-white hover:bg-white/20" : ""}
              >
                <Link to="/auth">Sign In</Link>
              </Button>
            )}

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
                  {user ? (
                    <>
                      <Button asChild variant="ghost" className="justify-start">
                        <Link to="/dashboard">Dashboard</Link>
                      </Button>
                      <Button asChild variant="ghost" className="justify-start">
                        <Link to="/profile">Profile</Link>
                      </Button>
                      <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
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
          </div>
        </div>
      </div>
    </header>
  )
}

// Add this component to check for admin status and render admin link
const AdminLink = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });
        
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
  if (!isAdmin) return null;
  
  return (
    <DropdownMenuItem asChild>
      <Link to="/admin">
        <Settings className="mr-2 h-4 w-4" />
        <span>Admin Panel</span>
      </Link>
    </DropdownMenuItem>
  );
}

export default Navbar;
