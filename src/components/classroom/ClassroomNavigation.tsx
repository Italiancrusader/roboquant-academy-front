
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface ClassroomNavigationProps {
  courseName: string;
}

const ClassroomNavigation: React.FC<ClassroomNavigationProps> = ({ courseName }) => {
  const { user } = useAuth();
  
  // Helper function to get avatar fallback
  const getAvatarFallback = () => {
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };
  
  return (
    <div className="flex items-center justify-between py-2 px-4 border-b">
      <div className="hidden">
        <Link to="/courses" className="flex items-center">
          <span className="font-semibold">{courseName}</span>
        </Link>
      </div>
      
      <div className="relative w-1/3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search" 
          className="pl-9 h-9 bg-muted/50"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt={user?.email || 'User'} />
          <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default ClassroomNavigation;
