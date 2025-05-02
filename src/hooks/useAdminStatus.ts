
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useAdminStatus = (userId?: string) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!userId) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: userId,
          _role: 'admin',
        });

        if (error) {
          console.error("Error checking admin status:", error);
          toast({
            title: "Error checking admin status",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }
        
        setIsAdmin(!!data);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      checkAdminStatus();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  return { isAdmin, isLoading };
};
