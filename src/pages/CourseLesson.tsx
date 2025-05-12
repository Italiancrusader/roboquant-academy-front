import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import LessonView from '@/components/LessonView';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import CourseModule from '@/components/course/CourseModule';
import ClassroomHeader from '@/components/classroom/ClassroomHeader';
import ClassroomNavigation from '@/components/classroom/ClassroomNavigation';
import Footer from '@/components/Footer';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  video_url: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null; // Updated to match database column name
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
  const [activeTab, setActiveTab] = useState<string>("classroom");

  useEffect(() => {
    if (!courseId) return;
    
    const fetchCourseData = async () => {
      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, title, description, cover_image') // Updated to use cover_image
          .eq('id', courseId)
          .single();
          
        if (courseError) throw courseError;
        if (courseData) {
          setCourse(courseData);
        }
        
        // Fetch all modules and lessons for the course
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .eq('course_id', courseId)
          .order('sort_order', { ascending: true });
          
        if (modulesError) throw modulesError;
        
        // Fetch all lessons 
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
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
        
        // Initialize modules from fetched module data
        if (modulesData) {
          modulesData.forEach(module => {
            groupedModules[module.id] = {
              id: module.id,
              title: module.title,
              sort_order: module.sort_order,
              duration_minutes: 0,
              lessons: []
            };
          });
        }
        
        // Add uncategorized module if needed
        if (!groupedModules['uncategorized']) {
          groupedModules['uncategorized'] = {
            id: 'uncategorized',
            title: 'Uncategorized',
            sort_order: 999,
            duration_minutes: 0,
            lessons: []
          };
        }
        
        // Distribute lessons to their modules
        if (lessonsData) {
          lessonsData.forEach(lesson => {
            const moduleId = lesson.module_id || 'uncategorized';
            // If module exists, add lesson to it, otherwise add to uncategorized
            const targetModule = groupedModules[moduleId] || groupedModules['uncategorized'];
            
            targetModule.lessons.push(lesson);
            targetModule.duration_minutes = 
              (targetModule.duration_minutes || 0) + (lesson.duration_minutes || 0);
          });
        }
        
        // Convert to array and sort modules
        const moduleArray = Object.values(groupedModules)
          .filter(module => module.lessons.length > 0) // Only show modules with lessons
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
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 pt-16 pb-20 flex-grow">
        <ClassroomNavigation courseName={course?.title || 'Course'} />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with modules and lessons */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="mb-4">
                {course && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-1">{course.title}</h2>
                    {/* Progress bar */}
                    <div className="flex items-center gap-2">
                      <Progress value={progressPercentage} className="h-2 flex-grow" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {progressPercentage}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <ScrollArea className="h-[calc(100vh-220px)] pr-4">
                <div className="space-y-4 pb-16">
                  {modules.map((module) => (
                    <CourseModule 
                      key={module.id}
                      title={module.title}
                      lessons={module.lessons}
                      courseId={courseId || ''}
                      currentLessonId={lessonId}
                      completedLessons={progress}
                      durationMinutes={module.duration_minutes}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3">
            {course && (
              <ClassroomHeader 
                title={currentLesson?.title || 'Lesson'} 
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            )}
            
            <LessonView currentLesson={currentLesson} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseLesson;
