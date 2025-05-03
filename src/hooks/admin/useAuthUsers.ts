
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

type AuthUser = {
  id: string;
  email: string;
  created_at: string;
}

export const useAuthUsers = () => {
  return useQuery({
    queryKey: ['auth-users'],
    queryFn: async (): Promise<AuthUser[]> => {
      const { data, error } = await supabase
        .from('auth_users_view')
        .select('id, email, created_at')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error fetching users',
          description: error.message,
          variant: 'destructive',
        });
        
        return [];
      }
      
      return data || [];
    },
  });
};
