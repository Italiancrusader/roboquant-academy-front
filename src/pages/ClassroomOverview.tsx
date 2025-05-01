
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import ClassroomHeader from '@/components/classroom/ClassroomHeader';

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  modules_count: number;
  lessons_count: number;
  progress: number;
}

const ClassroomOverview = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("classroom");
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all enrolled courses
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user?.id);
          
        if (enrollmentsError) throw enrollmentsError;
        
        if (!enrollments || enrollments.length === 0) {
          setIsLoading(false);
          return;
        }
        
        const courseIds = enrollments.map(e => e.course_id);
        
        // Fetch course details
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('id, title, description, image_url')
          .in('id', courseIds);
          
        if (coursesError) throw coursesError;
        
        if (!coursesData) {
          setIsLoading(false);
          return;
        }
        
        // Get count of modules and lessons for each course
        const coursesWithDetails = await Promise.all(
          coursesData.map(async (course) => {
            // Get modules count
            const { count: modulesCount } = await supabase
              .from('modules')
              .select('id', { count: 'exact', head: true })
              .eq('course_id', course.id);
              
            // Get lessons count
            const { count: lessonsCount } = await supabase
              .from('lessons')
              .select('id', { count: 'exact', head: true })
              .eq('course_id', course.id)
              .eq('is_published', true);
              
            // Get completed lessons
            const { data: progress } = await supabase
              .from('progress')
              .select('lesson_id, completed')
              .eq('user_id', user?.id)
              .eq('course_id', course.id)
              .eq('completed', true);
              
            const completedLessons = progress?.length || 0;
            const progressPercentage = lessonsCount > 0 
              ? Math.round((completedLessons / lessonsCount) * 100) 
              : 0;
              
            return {
              ...course,
              modules_count: modulesCount || 0,
              lessons_count: lessonsCount || 0,
              progress: progressPercentage
            };
          })
        );
        
        setCourses(coursesWithDetails);
      } catch (error: any) {
        toast({
          title: "Error fetching courses",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchCourses();
    }
  }, [user]);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-16">
        <ClassroomHeader 
          title="My Courses" 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted"></div>
                <CardContent className="p-4">
                  <div className="h-6 bg-muted rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-2 bg-muted rounded w-full mb-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {courses.map((course) => (
              <Link to={`/courses/${course.id}`} key={course.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative">
                    {course.image_url ? (
                      <img 
                        src={course.image_url} 
                        alt={course.title} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-secondary">
                        <p className="text-lg font-medium">{course.title}</p>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-1 line-clamp-1">{course.title}</h3>
                    
                    <div className="mt-2 mb-1">
                      <Progress value={course.progress} className="h-1.5" />
                    </div>
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{course.progress}% complete</span>
                      <span>{course.lessons_count} lessons</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">You are not enrolled in any courses</h3>
            <p className="text-muted-foreground">Browse our course catalog to find something you're interested in.</p>
            <Link 
              to="/courses" 
              className="mt-4 inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomOverview;
