
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { UsersTable } from '@/components/admin/UsersTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthUsers } from '@/hooks/admin/useAuthUsers';

const AdminUsers = () => {
  const { totalCount, isLoading } = useAuthUsers();
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            View and manage all registered users in the system
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              {isLoading 
                ? 'Loading users...'
                : `${totalCount || 0} ${totalCount === 1 ? 'user' : 'users'} registered in the application`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
