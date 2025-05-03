
import React, { useState } from 'react';
import { useAuthUsers, AuthUser } from '@/hooks/admin/useAuthUsers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Search, X } from 'lucide-react';

export const UsersTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'created_at' | 'email'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { data: users, isLoading, error } = useAuthUsers({ 
    sortField, 
    sortOrder,
    searchTerm 
  });
  
  const toggleSort = (field: 'created_at' | 'email') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
        Failed to load users
      </div>
    );
  }
  
  if (!users || users.length === 0) {
    return (
      <div className="p-4 text-center border rounded-md">
        {searchTerm ? 'No users found matching your search.' : 'No users found. This could be because you don\'t have admin privileges.'}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search by email..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-1 top-1.5 h-6 w-6 p-0" 
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer"
              onClick={() => toggleSort('email')}
            >
              Email
              <ArrowUpDown className={`ml-2 h-4 w-4 inline-block ${sortField === 'email' ? 'opacity-100' : 'opacity-50'}`} />
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => toggleSort('created_at')}
            >
              Created At
              <ArrowUpDown className={`ml-2 h-4 w-4 inline-block ${sortField === 'created_at' ? 'opacity-100' : 'opacity-50'}`} />
            </TableHead>
            <TableHead>ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                {user.id}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
