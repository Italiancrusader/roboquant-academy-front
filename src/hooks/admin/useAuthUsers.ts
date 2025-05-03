
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type AuthUser = {
  id: string;
  email: string;
  created_at: string;
}

type SortField = 'created_at' | 'email';
type SortOrder = 'asc' | 'desc';

interface UseAuthUsersOptions {
  sortField?: SortField;
  sortOrder?: SortOrder;
  searchTerm?: string;
}

export const useAuthUsers = (options: UseAuthUsersOptions = {}) => {
  const { 
    sortField = 'created_at', 
    sortOrder = 'desc',
    searchTerm = ''
  } = options;
  
  return useQuery({
    queryKey: ['auth-users', sortField, sortOrder, searchTerm],
    queryFn: async (): Promise<AuthUser[]> => {
      let query = supabase
        .from('auth_users_view')
        .select('id, email, created_at')
        .order(sortField, { ascending: sortOrder === 'asc' });
      
      if (searchTerm) {
        query = query.ilike('email', `%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
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
