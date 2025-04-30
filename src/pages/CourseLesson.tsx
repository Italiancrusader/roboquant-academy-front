
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import LessonView from '@/components/LessonView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Play, Check, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  sort_order: number;
  is_published: boolean;
}

interface Course {
  id: string;
  title: string;
}

interface Progress {
  lesson_id: string;
  completed: boolean;
}

const CourseLesson = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!courseId) return;
    
    const fetchCourseData = async () => {
      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, title')
          .eq('id', courseId)
          .single();
          
        if (courseError) throw courseError;
        setCourse(courseData);
        
        // Fetch all lessons for the course
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .eq('is_published', true)
          .order('sort_order', { ascending: true });
          
        if (lessonsError) throw lessonsError;
        setLessons(lessonsData || []);
        
        // Fetch progress for all lessons if user is logged in
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from('progress')
            .select('lesson_id, completed')
            .eq('course_id', courseId)
            .eq('user_id', user.id);
            
          if (progressError) throw progressError;
          
          const progressMap: Record<string, boolean> = {};
          if (progressData) {
            progressData.forEach((item: Progress) => {
              progressMap[item.lesson_id] = item.completed;
            });
          }
          setProgress(progressMap);
        }
      } catch (error: any) {
        toast({
          title: "Error loading course data",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
    
    // Set up real-time subscription for progress updates
    if (user) {
      const channel = supabase
        .channel('progress-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'progress',
            filter: `user_id=eq.${user.id} AND course_id=eq.${courseId}`
          },
          (payload) => {
            if (payload.new) {
              setProgress(prev => ({
                ...prev,
                [payload.new.lesson_id]: payload.new.completed
              }));
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [courseId, user]);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">
                  {course ? course.title : 'Course Content'}
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  {lessons.map((lesson) => (
                    <Button
                      key={lesson.id}
                      variant="ghost"
                      className={cn(
                        "justify-start px-4 py-2 h-auto border-b border-border",
                        lessonId === lesson.id && "bg-muted",
                        progress[lesson.id] && "text-green-400"
                      )}
                      asChild
                    >
                      <a href={`/courses/${courseId}/lessons/${lesson.id}`}>
                        <div className="mr-2 p-1">
                          {progress[lesson.id] ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-grow text-left">
                          <div className="line-clamp-1">{lesson.title}</div>
                          {lesson.duration_minutes && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {lesson.duration_minutes} min
                            </div>
                          )}
                        </div>
                      </a>
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-2 lg:col-span-3">
            <LessonView />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLesson;
