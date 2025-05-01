
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminPayments = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Payment Management</h1>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4 mr-2" />
          <AlertTitle>Payment Integration Required</AlertTitle>
          <AlertDescription>
            To enable payment processing, please connect your Stripe account in the settings page. This will allow you to accept payments, manage subscriptions, and track revenue.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Revenue</CardTitle>
              <CardDescription>All time revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <p className="text-3xl font-bold">$0.00</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Current month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <p className="text-3xl font-bold">$0.00</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>Currently active</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest payment activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No transactions yet
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
