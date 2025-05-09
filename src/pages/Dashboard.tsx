
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Clock, Book } from 'lucide-react';
import { useAdminStatus } from '@/hooks/useAdminStatus';

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  duration_minutes: number | null;
  enrolled_at: string;
  progress: number;
  lesson_count: number;
  completed_lessons: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminStatus(user?.id);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) return;

      try {
        // If user is admin, fetch all courses
        if (isAdmin) {
          const { data: allCourses, error: coursesError } = await supabase
            .from('courses')
            .select('id, title, description, cover_image, duration_minutes');

          if (coursesError) throw coursesError;

          // Process courses for admin view
          const processedCourses = await Promise.all((allCourses || []).map(async (course) => {
            // Get lesson count
            const { count: lessonCount, error: lessonCountError } = await supabase
              .from('lessons')
              .select('id', { count: 'exact' })
              .eq('course_id', course.id)
              .eq('is_published', true);
              
            if (lessonCountError) throw lessonCountError;
            
            // Get progress data (admins may have progress records even without enrollment)
            const { data: progressData, error: progressError } = await supabase
              .from('progress')
              .select('id, completed')
              .eq('course_id', course.id)
              .eq('user_id', user.id);
              
            if (progressError) throw progressError;
            
            // Calculate completed lessons
            const completedLessons = progressData?.filter(p => p.completed).length || 0;
            
            // Calculate progress percentage
            const progressPercentage = (lessonCount || 0) > 0 
              ? Math.round((completedLessons / lessonCount) * 100)
              : 0;
              
            return {
              ...course,
              enrolled_at: new Date().toISOString(), // Admin is considered always enrolled
              progress: progressPercentage,
              lesson_count: lessonCount || 0,
              completed_lessons: completedLessons
            };
          }));
          
          setEnrolledCourses(processedCourses);
          setIsLoading(false);
          return;
        }
        
        // For regular users, continue with existing enrollment-based logic
        // Get all enrollments for the current user
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('course_id, enrolled_at')
          .eq('user_id', user.id);

        if (enrollmentsError) throw enrollmentsError;
        
        if (!enrollments || enrollments.length === 0) {
          setEnrolledCourses([]);
          setIsLoading(false);
          return;
        }

        // Get course details for each enrollment
        const courseIds = enrollments.map(enrollment => enrollment.course_id);
        
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('id, title, description, cover_image, duration_minutes')
          .in('id', courseIds);

        if (coursesError) throw coursesError;

        // Get lesson counts for each course
        const lessonCountPromises = courseIds.map(courseId => 
          supabase
            .from('lessons')
            .select('id', { count: 'exact' })
            .eq('course_id', courseId)
            .eq('is_published', true)
        );

        const lessonCounts = await Promise.all(lessonCountPromises);
        
        // Get completed lesson counts for each course
        const completedLessonPromises = courseIds.map(courseId => 
          supabase
            .from('progress')
            .select('id', { count: 'exact' })
            .eq('course_id', courseId)
            .eq('user_id', user.id)
            .eq('completed', true)
        );

        const completedLessonCounts = await Promise.all(completedLessonPromises);

        // Combine all data
        const courseData = courses?.map((course, index) => {
          const enrollment = enrollments.find(e => e.course_id === course.id);
          const lessonCount = lessonCounts[index].count || 0;
          const completedLessons = completedLessonCounts[index].count || 0;
          const progressPercentage = lessonCount > 0 
            ? Math.round((completedLessons / lessonCount) * 100) 
            : 0;

          return {
            ...course,
            enrolled_at: enrollment?.enrolled_at || '',
            progress: progressPercentage,
            lesson_count: lessonCount,
            completed_lessons: completedLessons
          };
        });

        setEnrolledCourses(courseData || []);
      } catch (error: any) {
        toast({
          title: "Error loading enrolled courses",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user, isAdmin]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <h1 className="text-3xl font-bold gradient-text mb-2">Your Dashboard</h1>
        <p className="text-muted-foreground mb-8">Track your progress and continue your learning journey</p>
        
        {/* Admin Quick Link - Only for admins */}
        {isAdmin && (
          <Card className="mb-10">
            <CardHeader>
              <CardTitle>Admin Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You have admin privileges. Use the admin panel to manage courses and users.</p>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button asChild variant="outline">
                  <Link to="/admin/dashboard">Admin Dashboard</Link>
                </Button>
                <Button asChild>
                  <Link to="/admin/courses">Manage Courses</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <h2 className="text-2xl font-semibold mb-4">My Courses</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border">
            <Book className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">You haven't enrolled in any courses yet</h3>
            <p className="text-muted-foreground mb-6">Start your learning journey today</p>
            <Button asChild>
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Card className="h-full" key={course.id}>
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  {course.cover_image ? (
                    <img 
                      src={course.cover_image} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-accent flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{course.completed_lessons} / {course.lesson_count} lessons completed</span>
                      {course.duration_minutes && (
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.floor(course.duration_minutes / 60)} hrs {course.duration_minutes % 60} mins
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link to={`/courses/${course.id}`}>
                      {course.completed_lessons > 0 ? "Continue Learning" : "Start Course"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
