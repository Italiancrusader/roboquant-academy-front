
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sample data for the dashboard analytics
  const coursesData = [
    { name: 'Trading Basics', students: 45, completion: 72 },
    { name: 'Advanced Strategies', students: 32, completion: 68 },
    { name: 'Algorithmic Trading', students: 28, completion: 55 },
    { name: 'Market Analysis', students: 38, completion: 63 },
  ];

  const engagementData = [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 25 },
    { name: 'Wed', value: 18 },
    { name: 'Thu', value: 32 },
    { name: 'Fri', value: 27 },
    { name: 'Sat', value: 15 },
    { name: 'Sun', value: 9 },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Courses</CardTitle>
              <CardDescription>Active courses in the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">4</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Students</CardTitle>
              <CardDescription>Registered students</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">143</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Completion Rate</CardTitle>
              <CardDescription>Average course completion</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">64.5%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Course Enrollment</CardTitle>
              <CardDescription>Students enrolled per course</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[300px]" config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={coursesData}
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="students" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Weekly Engagement</CardTitle>
              <CardDescription>Platform activity over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[300px]" config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={engagementData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4 mr-2" />
          <AlertTitle>Quick Tip</AlertTitle>
          <AlertDescription>
            Use the sidebar to navigate between different admin sections. You can manage courses, lessons, and user accounts.
          </AlertDescription>
        </Alert>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
