
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const AdminAnalytics = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4 mr-2" />
          <AlertTitle>Coming Soon</AlertTitle>
          <AlertDescription>
            Advanced analytics features are under development. Check back soon for detailed insights on user engagement, course performance, and revenue metrics.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Daily active users and session metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
              Coming soon
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Sales trends and revenue tracking</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
              Coming soon
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>Most viewed and completed lessons</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
              Coming soon
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
