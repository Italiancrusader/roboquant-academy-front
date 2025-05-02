
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Users, Clock, BookOpen } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const CourseAnalytics = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseTitle, setCourseTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);
  const [completionData, setCompletionData] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [lessonPerformance, setLessonPerformance] = useState<any[]>([]);
  
  useEffect(() => {
    if (!courseId) return;
    
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch course title
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('title')
          .eq('id', courseId)
          .single();
          
        if (courseError) throw courseError;
        setCourseTitle(courseData.title);
        
        // For demo purposes, we'll use mock data
        // In a real implementation, these would be API calls to the database
        
        // Mock enrollment data - past 30 days
        const mockEnrollmentData = generateMockDailyData(30, 0, 5);
        setEnrollmentData(mockEnrollmentData);
        
        // Mock completion rates
        const mockCompletionData = [
          { name: 'Completed', value: 45 },
          { name: 'In Progress', value: 35 },
          { name: 'Not Started', value: 20 },
        ];
        setCompletionData(mockCompletionData);
        
        // Mock engagement data
        const mockEngagementData = generateMockDailyData(7, 20, 60);
        setEngagementData(mockEngagementData);
        
        // Mock lesson performance
        const mockLessonPerformance = [
          { name: 'Lesson 1', completion: 95 },
          { name: 'Lesson 2', completion: 88 },
          { name: 'Lesson 3', completion: 76 },
          { name: 'Lesson 4', completion: 65 },
          { name: 'Lesson 5', completion: 52 },
          { name: 'Lesson 6', completion: 45 },
          { name: 'Lesson 7', completion: 35 },
        ];
        setLessonPerformance(mockLessonPerformance);
        
      } catch (error: any) {
        toast({
          title: "Error loading analytics",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [courseId]);
  
  // Helper function to generate mock daily data
  const generateMockDailyData = (days: number, min: number, max: number) => {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * (max - min + 1) + min)
      });
    }
    
    return data;
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{courseTitle} - Analytics</h1>
            <p className="text-muted-foreground">Data insights for your course</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Enrollments</CardTitle>
              <CardDescription>Cumulative enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="w-8 h-8 text-primary mr-4" />
                <p className="text-3xl font-bold">124</p>
              </div>
              <p className="text-sm text-green-500 mt-2">+12% this month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Average Completion</CardTitle>
              <CardDescription>Average course completion rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-primary mr-4" />
                <p className="text-3xl font-bold">68%</p>
              </div>
              <p className="text-sm text-green-500 mt-2">+5% vs last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Avg. Engagement Time</CardTitle>
              <CardDescription>Time spent per user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-primary mr-4" />
                <p className="text-3xl font-bold">3.5h</p>
              </div>
              <p className="text-sm text-yellow-500 mt-2">-2% vs last month</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="enrollment" className="space-y-6">
          <TabsList>
            <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            <TabsTrigger value="completion">Completion</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="lessons">Lesson Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enrollment">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trend</CardTitle>
                <CardDescription>New enrollments over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={enrollmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Enrollments" 
                        stroke="#0088FE" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completion">
            <Card>
              <CardHeader>
                <CardTitle>Course Completion</CardTitle>
                <CardDescription>Student progress through the course</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex justify-center">
                <div className="h-80 w-full max-w-md">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={completionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {completionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Engagement</CardTitle>
                <CardDescription>Average minutes spent per day</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Minutes" 
                        stroke="#00C49F" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="lessons">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Completion Rates</CardTitle>
                <CardDescription>Percentage of students completing each lesson</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lessonPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completion" fill="#FFBB28" name="Completion %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default CourseAnalytics;
