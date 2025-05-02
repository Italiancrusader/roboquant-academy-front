
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { toast } from '@/components/ui/use-toast';

interface AdminCheckProps {
  children: React.ReactNode;
}

const AdminCheck: React.FC<AdminCheckProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log("AdminCheck: Checking admin status...");
      
      if (!user) {
        console.log("AdminCheck: No user found, denying access");
        setIsAdmin(false);
        setIsCheckingRole(false);
        return;
      }

      try {
        console.log(`AdminCheck: Checking if user ${user.id} is an admin...`);
        
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });

        if (error) {
          console.error("AdminCheck: Error checking admin status:", error);
          toast({
            title: "Error checking admin status",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }
        
        console.log("AdminCheck: Admin check result:", data);
        setIsAdmin(!!data);
        
        if (!data) {
          toast({
            title: "Access denied",
            description: "You don't have admin privileges",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("AdminCheck: Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsCheckingRole(false);
      }
    };

    if (user) {
      checkAdminStatus();
    } else {
      setIsCheckingRole(false);
    }
  }, [user]);

  if (isLoading || isCheckingRole) {
    return <LoadingAnimation />;
  }

  if (!user) {
    console.log("AdminCheck: Redirecting to auth - no user");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    console.log("AdminCheck: Redirecting to dashboard - not admin");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("AdminCheck: Access granted to admin area");
  return <>{children}</>;
};

export default AdminCheck;
