
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { toast } from '@/components/ui/use-toast';
import { useAdminStatus } from '@/hooks/useAdminStatus';

interface AdminCheckProps {
  children: React.ReactNode;
}

const AdminCheck: React.FC<AdminCheckProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const { isAdmin, isLoading: adminCheckLoading } = useAdminStatus(user?.id);
  
  const isLoading = authLoading || adminCheckLoading;

  // If still loading, show loading animation
  if (isLoading) {
    return <LoadingAnimation />;
  }

  // If no user, redirect to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user is not admin, show toast and redirect to dashboard
  if (!isAdmin) {
    toast({
      title: "Access denied",
      description: "You don't have admin privileges",
      variant: "destructive",
    });
    return <Navigate to="/dashboard" replace />;
  }

  // User is admin, render children
  return <>{children}</>;
};

export default AdminCheck;
