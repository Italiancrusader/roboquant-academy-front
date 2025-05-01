
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
import ClassroomNavigation from '@/components/classroom/ClassroomNavigation';
import CourseGrid from '@/components/course/CourseGrid';
import Footer from '@/components/Footer';

interface Course {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null; // Updated to match database column name
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
          .select('id, title, description, cover_image') // Updated to use cover_image
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
              ? Math.round((completedLessons / (lessonsCount || 1)) * 100) 
              : 0;
              
            return {
              ...course,
              modules_count: modulesCount || 0,
              lessons_count: lessonsCount || 0,
              progress: progressPercentage
            } as Course;
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
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'community':
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold mb-4">Community</h2>
            <p className="text-muted-foreground">Connect with fellow learners and discuss course materials.</p>
            <div className="mt-6 p-6 bg-muted/30 rounded-lg text-center">
              <p>Community features coming soon!</p>
            </div>
          </div>
        );
      case 'classroom':
        return (
          <div className="py-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <CourseGrid courses={courses} />
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
        );
      case 'calendar':
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold mb-4">Calendar</h2>
            <p className="text-muted-foreground">Track your learning schedule and upcoming events.</p>
            <div className="mt-6 p-6 bg-muted/30 rounded-lg text-center">
              <p>Calendar features coming soon!</p>
            </div>
          </div>
        );
      case 'members':
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold mb-4">Members</h2>
            <p className="text-muted-foreground">View all members enrolled in these courses.</p>
            <div className="mt-6 p-6 bg-muted/30 rounded-lg text-center">
              <p>Members directory coming soon!</p>
            </div>
          </div>
        );
      case 'leaderboards':
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold mb-4">Leaderboards</h2>
            <p className="text-muted-foreground">See who's leading in course completion and achievements.</p>
            <div className="mt-6 p-6 bg-muted/30 rounded-lg text-center">
              <p>Leaderboard features coming soon!</p>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-muted-foreground mb-4">Learn more about RoboQuant Academy and our course offerings.</p>
            <div className="prose max-w-none">
              <p>RoboQuant Academy is dedicated to providing high-quality education in algorithmic trading, quantitative finance, and machine learning for traders.</p>
              <p className="mt-4">Our mission is to empower traders with the knowledge and tools they need to succeed in today's markets.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold mb-4">Classroom</h2>
            <p>Select a course to begin learning.</p>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 pt-16 flex-grow">
        <ClassroomNavigation courseName="My Courses" />
        <ClassroomHeader 
          title="My Courses" 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        
        {renderTabContent()}
      </div>
      <Footer />
    </div>
  );
};

export default ClassroomOverview;
