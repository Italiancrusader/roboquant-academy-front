
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import LessonView from '@/components/LessonView';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Clock, CheckCircle2, Circle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface Module {
  id: string;
  title: string;
  sort_order: number;
  duration_minutes: number | null;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  sort_order: number;
  is_published: boolean;
  module_id: string | null;
  has_attachments: boolean;
}

interface Course {
  id: string;
  title: string;
}

const CourseLesson = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [progressPercentage, setProgressPercentage] = useState(0);
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
          .select('*, module:module_id(id, title, sort_order)')
          .eq('course_id', courseId)
          .eq('is_published', true)
          .order('sort_order', { ascending: true });
          
        if (lessonsError) throw lessonsError;

        // Get the current lesson
        if (lessonId && lessonsData) {
          const current = lessonsData.find(lesson => lesson.id === lessonId);
          if (current) {
            setCurrentLesson(current);
          }
        }
        
        // Group lessons by module
        const groupedModules: Record<string, Module> = {};
        
        lessonsData?.forEach(lesson => {
          const moduleId = lesson.module?.id || 'uncategorized';
          const moduleTitle = lesson.module?.title || 'Uncategorized';
          const moduleSortOrder = lesson.module?.sort_order || 999;
          
          if (!groupedModules[moduleId]) {
            groupedModules[moduleId] = {
              id: moduleId,
              title: moduleTitle,
              sort_order: moduleSortOrder,
              duration_minutes: 0,
              lessons: []
            };
          }
          
          groupedModules[moduleId].lessons.push(lesson);
          groupedModules[moduleId].duration_minutes = 
            (groupedModules[moduleId].duration_minutes || 0) + (lesson.duration_minutes || 0);
        });
        
        // Convert to array and sort modules
        const moduleArray = Object.values(groupedModules)
          .sort((a, b) => a.sort_order - b.sort_order);
        
        setModules(moduleArray);
        
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
            progressData.forEach((item) => {
              progressMap[item.lesson_id] = Boolean(item.completed);
            });
          }
          setProgress(progressMap);
          
          // Calculate progress percentage
          if (lessonsData && lessonsData.length > 0) {
            const completedCount = progressData?.filter(p => p.completed).length || 0;
            const percentage = Math.round((completedCount / lessonsData.length) * 100);
            setProgressPercentage(percentage);
          }
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
              const newPayload = payload.new as { lesson_id: string; completed: boolean };
              setProgress(prev => ({
                ...prev,
                [newPayload.lesson_id]: newPayload.completed
              }));
              
              // Recalculate progress percentage
              const completedCount = Object.values(progress).filter(Boolean).length + 1;
              const totalLessons = modules.reduce((acc, module) => acc + module.lessons.length, 0);
              const percentage = Math.round((completedCount / totalLessons) * 100);
              setProgressPercentage(percentage);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [courseId, lessonId, user]);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Sidebar with modules and lessons */}
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-4 space-y-6">
                {/* Progress bar */}
                <div className="space-y-2">
                  <p className="font-medium text-sm">Progress</p>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {progressPercentage}% complete. Keep it up.
                  </p>
                </div>

                <Separator />
                
                {/* Modules and lessons */}
                <div className="space-y-6">
                  {modules.map((module) => (
                    <div key={module.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{module.title}</h3>
                        {module.duration_minutes ? (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {module.duration_minutes} min
                          </div>
                        ) : null}
                      </div>
                      
                      <nav className="space-y-1">
                        {module.lessons.map((lesson) => (
                          <Button
                            key={lesson.id}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start px-2 py-1.5 h-auto text-sm",
                              lessonId === lesson.id && "bg-muted font-medium",
                              progress[lesson.id] && "text-green-400"
                            )}
                            asChild
                          >
                            <a href={`/courses/${courseId}/lessons/${lesson.id}`}>
                              <div className="mr-2 p-1">
                                {progress[lesson.id] ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-grow text-left">
                                <div className="line-clamp-1">{lesson.title}</div>
                                {lesson.duration_minutes && (
                                  <div className="text-xs text-muted-foreground">
                                    {lesson.duration_minutes} min
                                  </div>
                                )}
                              </div>
                              {lesson.has_attachments && (
                                <FileText className="h-4 w-4 text-muted-foreground ml-2" />
                              )}
                            </a>
                          </Button>
                        ))}
                      </nav>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-2 lg:col-span-3">
            <LessonView currentLesson={currentLesson} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLesson;
