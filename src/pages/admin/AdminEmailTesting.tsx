
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import EmailTester from '@/components/admin/email/EmailTester';
import { Separator } from '@/components/ui/separator';

const AdminEmailTesting = () => {
  return (
    <AdminLayout>
      <div className="container py-6 md:py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Email Testing</h1>
            <p className="text-muted-foreground">
              Send test emails to verify delivery and review templates.
            </p>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <EmailTester />
      </div>
    </AdminLayout>
  );
};

export default AdminEmailTesting;
