
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Book,
  FileText,
  Users,
  Settings,
  LogOut
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { signOut } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 hidden md:flex flex-col bg-card border-r shadow-sm">
        <div className="p-4 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">RoboQuant</span>
            <span className="text-sm bg-primary text-primary-foreground px-2 py-0.5 rounded">Admin</span>
          </Link>
        </div>
        
        <div className="flex-1 py-6 space-y-1">
          <Link to="/admin">
            <Button
              variant={isActive('/admin') ? 'secondary' : 'ghost'}
              className="w-full justify-start px-4"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          
          <Link to="/admin/courses">
            <Button
              variant={isActive('/admin/courses') ? 'secondary' : 'ghost'}
              className="w-full justify-start px-4"
            >
              <Book className="mr-2 h-4 w-4" />
              Courses
            </Button>
          </Link>
          
          <Link to="/admin/lessons">
            <Button
              variant={isActive('/admin/lessons') ? 'secondary' : 'ghost'}
              className="w-full justify-start px-4"
            >
              <FileText className="mr-2 h-4 w-4" />
              Lessons
            </Button>
          </Link>
          
          <Link to="/admin/users">
            <Button
              variant={isActive('/admin/users') ? 'secondary' : 'ghost'}
              className="w-full justify-start px-4"
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
          </Link>
          
          <Link to="/admin/settings">
            <Button
              variant={isActive('/admin/settings') ? 'secondary' : 'ghost'}
              className="w-full justify-start px-4"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
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
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
