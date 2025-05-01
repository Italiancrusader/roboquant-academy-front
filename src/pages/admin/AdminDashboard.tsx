
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar } from 'recharts';
import { Chart } from '@/components/ui/chart';
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
              <Chart
                className="h-[300px]"
                options={{
                  chart: { type: 'bar', toolbar: { show: false } },
                  plotOptions: { bar: { horizontal: true } },
                  dataLabels: { enabled: false },
                }}
                series={[{ data: coursesData.map(course => course.students) }]}
                type="bar"
                height={300}
              />
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Weekly Engagement</CardTitle>
              <CardDescription>Platform activity over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <Chart
                className="h-[300px]"
                options={{
                  chart: { type: 'line', toolbar: { show: false } },
                  stroke: { curve: 'smooth' },
                  xaxis: { categories: engagementData.map(d => d.name) },
                }}
                series={[{ name: 'Activity', data: engagementData.map(d => d.value) }]}
                type="line"
                height={300}
              />
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
