
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Info, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminCommunity = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Community Management</h1>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4 mr-2" />
          <AlertTitle>Coming Soon</AlertTitle>
          <AlertDescription>
            Community features are under development. Soon you'll be able to manage forums, discussion boards, and student interactions.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Forums</CardTitle>
              <CardDescription>Active discussion forums</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Posts</CardTitle>
              <CardDescription>All forum posts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Active Users</CardTitle>
              <CardDescription>Users active this week</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Forum Categories</CardTitle>
              <CardDescription>Manage discussion categories</CardDescription>
            </div>
            <Button disabled variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              New Category
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Topics</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No categories created yet
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

export default AdminCommunity;
