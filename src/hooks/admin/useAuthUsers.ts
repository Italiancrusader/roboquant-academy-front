
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
  page?: number;
  pageSize?: number;
}

export const useAuthUsers = (options: UseAuthUsersOptions = {}) => {
  const { 
    sortField = 'created_at', 
    sortOrder = 'desc',
    searchTerm = '',
    page = 1,
    pageSize = 10
  } = options;
  
  const [totalCount, setTotalCount] = useState(0);
  
  const query = useQuery({
    queryKey: ['auth-users', sortField, sortOrder, searchTerm, page, pageSize],
    queryFn: async (): Promise<AuthUser[]> => {
      try {
        // First get the total count for pagination
        let countQuery = supabase
          .from('auth_users_view')
          .select('id', { count: 'exact', head: true });
        
        if (searchTerm) {
          countQuery = countQuery.ilike('email', `%${searchTerm}%`);
        }
        
        const { count, error: countError } = await countQuery;
        
        if (countError) {
          console.error('Error counting users:', countError);
          toast({
            title: 'Error counting users',
            description: countError.message,
            variant: 'destructive',
          });
        } else {
          setTotalCount(count || 0);
        }
        
        // Then fetch the paginated data
        let dataQuery = supabase
          .from('auth_users_view')
          .select('id, email, created_at')
          .order(sortField, { ascending: sortOrder === 'asc' });
        
        if (searchTerm) {
          dataQuery = dataQuery.ilike('email', `%${searchTerm}%`);
        }
        
        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        dataQuery = dataQuery.range(from, to);
        
        const { data, error } = await dataQuery;
        
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
      } catch (error: any) {
        console.error('Unexpected error:', error);
        toast({
          title: 'Unexpected error',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
        
        return [];
      }
    },
  });
  
  return {
    ...query,
    totalCount,
    pageCount: Math.ceil(totalCount / pageSize),
    currentPage: page
  };
};
