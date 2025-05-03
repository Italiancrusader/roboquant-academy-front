
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Book,
  FileText,
  Settings,
  LogOut,
  BarChart,
  DollarSign,
  MessageSquare,
  Bell,
  Award,
  Users
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => (
  <Link to={to}>
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className="w-full justify-start px-4"
    >
      {icon}
      {label}
    </Button>
  </Link>
);

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { to: '/admin', icon: <LayoutDashboard className="mr-2 h-4 w-4" />, label: 'Dashboard' },
    { to: '/admin/analytics', icon: <BarChart className="mr-2 h-4 w-4" />, label: 'Analytics' },
    { to: '/admin/courses', icon: <Book className="mr-2 h-4 w-4" />, label: 'Courses' },
    { to: '/admin/lessons', icon: <FileText className="mr-2 h-4 w-4" />, label: 'Lessons' },
    { to: '/admin/users', icon: <Users className="mr-2 h-4 w-4" />, label: 'Users' },
    { to: '/admin/payments', icon: <DollarSign className="mr-2 h-4 w-4" />, label: 'Payments' },
    { to: '/admin/certificates', icon: <Award className="mr-2 h-4 w-4" />, label: 'Certificates' },
    { to: '/admin/community', icon: <MessageSquare className="mr-2 h-4 w-4" />, label: 'Community' },
    { to: '/admin/notifications', icon: <Bell className="mr-2 h-4 w-4" />, label: 'Notifications' },
    { to: '/admin/settings', icon: <Settings className="mr-2 h-4 w-4" />, label: 'Settings' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="w-64 hidden md:flex flex-col bg-card border-r shadow-sm">
        <div className="p-4 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">RoboQuant</span>
            <span className="text-sm bg-primary text-primary-foreground px-2 py-0.5 rounded">Admin</span>
          </Link>
        </div>
        
        <div className="flex-1 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            // Add separators between groups
            const showSeparator = index === 1 || index === 5 || index === 7;
            return (
              <React.Fragment key={item.to}>
                {showSeparator && <Separator className="my-2" />}
                <NavItem
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  isActive={isActive(item.to)}
                />
              </React.Fragment>
            );
          })}
        </div>
        
        <div className="p-4 border-t mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-background border-b p-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">RoboQuant</span>
          <span className="text-sm bg-primary text-primary-foreground px-2 py-0.5 rounded">Admin</span>
        </Link>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="sr-only">Toggle menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("transition-transform", 
              isMobileMenuOpen ? "rotate-90" : ""
            )}
          >
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </Button>
      </div>
      
      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-0 z-20 bg-background md:hidden transition-transform transform",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="pt-16 pb-6 h-full overflow-y-auto">
          <div className="space-y-1 p-4">
            {navItems.map((item, index) => {
              // Add separators between groups
              const showSeparator = index === 1 || index === 5 || index === 7;
              return (
                <React.Fragment key={item.to}>
                  {showSeparator && <Separator className="my-2" />}
                  <NavItem
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    isActive={isActive(item.to)}
                  />
                </React.Fragment>
              );
            })}
          </div>
          
          <div className="p-4 border-t mt-auto">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                signOut();
                setIsMobileMenuOpen(false);
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
