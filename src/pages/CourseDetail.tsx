
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Clock, Play, ChevronRight, Award } from 'lucide-react';

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
  const [isEnrolling, setIsEnrolling] = useState(false);

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

  const handleEnroll = async () => {
    if (!user) {
      navigate('/auth', { state: { from: `/courses/${courseId}` } });
      return;
    }

    if (!course) return;

    setIsEnrolling(true);
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
        })
        .select()
        .single();

      if (error) throw error;

      setEnrollment(data);
      toast({
        title: "Successfully enrolled",
        description: `You are now enrolled in ${course.title}`,
      });
    } catch (error: any) {
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const getLevelBadge = (level: string | null) => {
    switch (level) {
      case 'beginner':
        return <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800">Beginner</Badge>;
      case 'intermediate':
        return <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-800">Intermediate</Badge>;
      case 'advanced':
        return <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-800">Advanced</Badge>;
      default:
        return null;
    }
  };

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
            <div className="mb-6">
              <Link to="/courses" className="text-muted-foreground hover:text-foreground flex items-center mb-4">
                <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
                Back to Courses
              </Link>
              <h1 className="text-3xl font-bold gradient-text mb-2">{course.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                {course.level && getLevelBadge(course.level)}
                {course.duration_minutes && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {Math.floor(course.duration_minutes / 60)} hrs {course.duration_minutes % 60} mins
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Course Description</h2>
              <div className="prose prose-invert max-w-none">
                <p>{course.description}</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Course Content</h2>
              {lessons.length === 0 ? (
                <Card>
                  <CardContent className="py-6">
                    <p className="text-center text-muted-foreground">No lessons available yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{lessons.length} Lessons</CardTitle>
                      {course.duration_minutes && (
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {Math.floor(course.duration_minutes / 60)} hrs {course.duration_minutes % 60} mins
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="divide-y divide-border">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start">
                            <div className="mr-4 mt-1">
                              <div className="bg-primary/20 rounded-full p-1">
                                <Play className="h-3 w-3 text-primary" />
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">{lesson.title}</p>
                              {lesson.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">{lesson.description}</p>
                              )}
                            </div>
                          </div>
                          {lesson.duration_minutes && (
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {lesson.duration_minutes} min
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              {course.cover_image && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img 
                    src={course.cover_image} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="pt-6 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">${course.price.toFixed(2)}</span>
                </div>
                
                {enrollment ? (
                  <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                    Already Enrolled
                  </Button>
                ) : (
                  <Button 
                    className="w-full cta-button" 
                    onClick={handleEnroll} 
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? "Processing..." : "Enroll Now"}
                  </Button>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">Full lifetime access</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">Learn at your own pace</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
