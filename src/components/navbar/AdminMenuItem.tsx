
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const AdminMenuItem: React.FC = () => {
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
};
