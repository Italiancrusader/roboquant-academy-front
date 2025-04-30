
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// Import our new components
import CourseHeader from '@/components/course/CourseHeader';
import CourseDescription from '@/components/course/CourseDescription';
import CourseContentList from '@/components/course/CourseContentList';
import EnrollmentCard from '@/components/course/EnrollmentCard';

interface Course {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  price: number;
  duration_minutes: number | null;
  level: string | null;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  sort_order: number;
}

interface Enrollment {
  id: string;
  enrolled_at: string;
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firstLesson, setFirstLesson] = useState<string | null>(null);
  const [lastAccessedLesson, setLastAccessedLesson] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseDetails = async () => {
      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);

        // Fetch lessons for the course
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .eq('is_published', true)
          .order('sort_order', { ascending: true });

        if (lessonsError) throw lessonsError;
        setLessons(lessonsData || []);
        
        // Get the first lesson ID
        if (lessonsData && lessonsData.length > 0) {
          setFirstLesson(lessonsData[0].id);
        }

        // Check if user is enrolled
        if (user) {
          const { data: enrollmentData, error: enrollmentError } = await supabase
            .from('enrollments')
            .select('*')
            .eq('course_id', courseId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (enrollmentError) throw enrollmentError;
          setEnrollment(enrollmentData);

          // Find the last accessed lesson for this course
          const { data: progressData, error: progressError } = await supabase
            .from('progress')
            .select('lesson_id, last_accessed_at')
            .eq('course_id', courseId)
            .eq('user_id', user.id)
            .order('last_accessed_at', { ascending: false })
            .limit(1);
          
          if (!progressError && progressData && progressData.length > 0) {
            setLastAccessedLesson(progressData[0].lesson_id);
          }
        }
      } catch (error: any) {
        toast({
          title: "Error loading course",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="mb-8">The course you're looking for does not exist or has been removed.</p>
          <Button asChild>
            <Link to="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <CourseHeader 
              title={course.title}
              level={course.level}
              duration_minutes={course.duration_minutes}
            />

            <CourseDescription description={course.description} />

            <CourseContentList 
              lessons={lessons} 
              totalDuration={course.duration_minutes}
            />
          </div>

          <div className="space-y-6">
            <EnrollmentCard
              courseId={courseId || ''}
              userId={user?.id}
              courseTitle={course.title}
              price={course.price}
              coverImage={course.cover_image}
              enrollment={enrollment}
              firstLesson={firstLesson}
              lastAccessedLesson={lastAccessedLesson}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
