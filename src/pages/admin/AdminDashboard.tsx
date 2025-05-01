
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CourseData {
  name: string;
  students: number;
  completion: number;
}

interface EngagementData {
  name: string;
  value: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coursesData, setCoursesData] = useState<CourseData[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [avgCompletionRate, setAvgCompletionRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch total number of courses
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('id, title');
          
        if (coursesError) throw coursesError;
        setTotalCourses(courses?.length || 0);
        
        // Fetch unique enrolled students
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('user_id')
          .order('user_id');
          
        if (enrollmentsError) throw enrollmentsError;
        
        // Get unique student count
        const uniqueStudents = new Set(enrollments?.map(e => e.user_id));
        setTotalStudents(uniqueStudents.size);
        
        // Get course enrollment and completion data
        const courseDataPromises = courses?.map(async (course) => {
          // Get enrollments for this course
          const { data: courseEnrollments, error: enrollError } = await supabase
            .from('enrollments')
            .select('user_id')
            .eq('course_id', course.id);
            
          if (enrollError) throw enrollError;
          
          // Get all lessons for this course
          const { data: lessons, error: lessonsError } = await supabase
            .from('lessons')
            .select('id')
            .eq('course_id', course.id)
            .eq('is_published', true);
            
          if (lessonsError) throw lessonsError;
          
          // Get completion data for this course
          const { data: completions, error: completionsError } = await supabase
            .from('progress')
            .select('user_id, completed')
            .eq('course_id', course.id)
            .eq('completed', true);
            
          if (completionsError) throw completionsError;
          
          // Calculate completion percentage
          const totalLessons = lessons?.length || 1; // Avoid division by zero
          const totalEnrollments = courseEnrollments?.length || 0;
          const totalCompletions = completions?.length || 0;
          
          // Assuming each user completes each lesson once
          const completionPercentage = totalEnrollments > 0 && totalLessons > 0 
            ? Math.round((totalCompletions / (totalEnrollments * totalLessons)) * 100) 
            : 0;
          
          return {
            name: course.title,
            students: courseEnrollments?.length || 0,
            completion: completionPercentage
          };
        }) || [];
        
        // Wait for all promises to resolve
        const resolvedCourseData = await Promise.all(courseDataPromises);
        setCoursesData(resolvedCourseData);
        
        // Calculate average completion rate
        const totalCompletionRate = resolvedCourseData.reduce((sum, course) => sum + course.completion, 0);
        setAvgCompletionRate(
          resolvedCourseData.length > 0 ? 
          parseFloat((totalCompletionRate / resolvedCourseData.length).toFixed(1)) : 
          0
        );
        
        // Generate engagement data for the past week
        const weekEngagement = await fetchWeeklyEngagementData();
        setEngagementData(weekEngagement);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const fetchWeeklyEngagementData = async () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: EngagementData[] = [];
    
    // Get current date and time
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    for (let i = 6; i >= 0; i--) {
      // Calculate the date for each day of the past week
      const dayOffset = (currentDay - i + 7) % 7;  // Ensure we wrap around properly
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - i);
      
      // Format date for database query
      const startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
      
      // Query the progress table for last_accessed_at within this day
      const { data, error } = await supabase
        .from('progress')
        .select('id')
        .gte('last_accessed_at', startDate.toISOString())
        .lte('last_accessed_at', endDate.toISOString());
        
      if (error) {
        console.error('Error fetching engagement data:', error);
        result.push({ name: days[dayOffset], value: 0 });
      } else {
        result.push({ name: days[dayOffset], value: data?.length || 0 });
      }
    }
    
    return result;
  };

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
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse bg-muted rounded-md"></div>
              ) : (
                <p className="text-3xl font-bold">{totalCourses}</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Students</CardTitle>
              <CardDescription>Registered students</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse bg-muted rounded-md"></div>
              ) : (
                <p className="text-3xl font-bold">{totalStudents}</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Completion Rate</CardTitle>
              <CardDescription>Average course completion</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse bg-muted rounded-md"></div>
              ) : (
                <p className="text-3xl font-bold">{avgCompletionRate}%</p>
              )}
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
              {isLoading ? (
                <div className="h-[300px] w-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : coursesData.length > 0 ? (
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
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No course enrollment data available
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Weekly Engagement</CardTitle>
              <CardDescription>Platform activity over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] w-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : engagementData.length > 0 ? (
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
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No engagement data available
                </div>
              )}
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
