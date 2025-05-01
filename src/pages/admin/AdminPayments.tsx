
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, DollarSign, ExternalLink } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Enrollment {
  id: string;
  created_at: string;
  user_id: string;
  course_id: string;
  stripe_session_id: string;
  payment_status: string;
  user_email?: string;
  course_title?: string;
}

const AdminPayments = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select(`
            id, 
            created_at, 
            user_id, 
            course_id, 
            stripe_session_id, 
            payment_status, 
            profiles:user_id (email),
            courses:course_id (title, price)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to include user_email and course_title
        const transformedData = data.map(item => ({
          id: item.id,
          created_at: item.created_at,
          user_id: item.user_id,
          course_id: item.course_id,
          stripe_session_id: item.stripe_session_id || '',
          payment_status: item.payment_status || 'completed',
          user_email: item.profiles?.email || 'unknown',
          course_title: item.courses?.title || 'unknown',
          price: item.courses?.price || 0
        }));

        setEnrollments(transformedData);
        
        // Calculate total revenue
        const total = transformedData.reduce((sum, item) => sum + (item.price || 0), 0);
        setTotalRevenue(total);
        
        // Calculate monthly revenue (current month)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthly = transformedData
          .filter(item => {
            const date = new Date(item.created_at);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          })
          .reduce((sum, item) => sum + (item.price || 0), 0);
        
        setMonthlyRevenue(monthly);
      } catch (error: any) {
        toast({
          title: "Error loading payments",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Payment Management</h1>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4 mr-2" />
          <AlertTitle>Stripe Integration Active</AlertTitle>
          <AlertDescription>
            Your Stripe integration is active and processing payments. For detailed transaction analytics, please visit the Stripe dashboard.
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                className="flex items-center"
              >
                Stripe Dashboard <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
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
                <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
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
                <p className="text-3xl font-bold">${monthlyRevenue.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Active Enrollments</CardTitle>
              <CardDescription>Total successful enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{enrollments.length}</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest payment activity</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Session ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.length > 0 ? (
                    enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>{formatDate(enrollment.created_at)}</TableCell>
                        <TableCell>{enrollment.user_email}</TableCell>
                        <TableCell>{enrollment.course_title}</TableCell>
                        <TableCell>${(enrollment.price || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            enrollment.payment_status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {enrollment.payment_status}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {enrollment.stripe_session_id 
                            ? enrollment.stripe_session_id.substring(0, 10) + '...' 
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
