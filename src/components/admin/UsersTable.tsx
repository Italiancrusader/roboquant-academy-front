
import React from 'react';
import { useAuthUsers } from '@/hooks/admin/useAuthUsers';
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

export const UsersTable = () => {
  const { data: users, isLoading, error } = useAuthUsers();
  
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
        No users found. This could be because you don't have admin privileges.
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Created At</TableHead>
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
  );
};
