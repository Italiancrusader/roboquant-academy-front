
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import UserManagement from '@/pages/admin/UserManagement';

const AdminUsers = () => {
  return (
    <AdminLayout>
      <UserManagement />
    </AdminLayout>
  );
};

export default AdminUsers;
