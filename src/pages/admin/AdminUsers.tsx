
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { UsersTable } from '@/components/admin/UsersTable';

const AdminUsers = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            View all registered users in the system
          </p>
        </div>
        
        <div className="rounded-md border bg-card">
          <div className="p-6">
            <UsersTable />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
