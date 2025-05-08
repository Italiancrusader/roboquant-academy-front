
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import TicketsManager from '@/components/admin/TicketsManager';
import { QuickTip } from '@/components/admin/dashboard';

const AdminSupport = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">Support Management</h1>
        <p className="text-muted-foreground mb-6">
          Manage support tickets and respond to user inquiries
        </p>

        <QuickTip 
          title="Support Management" 
          description="Respond to user tickets promptly to provide the best customer experience. You can update ticket status and exchange messages with users here."
        />

        <TicketsManager />
      </div>
    </AdminLayout>
  );
};

export default AdminSupport;
