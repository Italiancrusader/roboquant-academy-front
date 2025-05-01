
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Info, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminNotifications = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Notification Management</h1>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4 mr-2" />
          <AlertTitle>Coming Soon</AlertTitle>
          <AlertDescription>
            Notification management features are under development. Soon you'll be able to send custom notifications, set up automated messages, and manage communication with users.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Sent</CardTitle>
              <CardDescription>All time notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Open Rate</CardTitle>
              <CardDescription>Average open rate</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0%</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Scheduled</CardTitle>
              <CardDescription>Pending notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest notifications sent to users</CardDescription>
            </div>
            <Button disabled variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              New Notification
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Open Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No notifications sent yet
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

export default AdminNotifications;
