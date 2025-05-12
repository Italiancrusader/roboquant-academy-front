
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  sort_order: number;
}

interface Attachment {
  id: string;
  name: string;
  file_url: string;
  type: string;
}

interface UseLessonResult {
  lesson: Lesson | null;
  nextLesson: Lesson | null;
  prevLesson: Lesson | null;
  attachments: Attachment[];
  isLoading: boolean;
  isAdmin: boolean;
}

export const useLesson = (
  courseId: string | undefined, 
  lessonId: string | undefined,
  currentLesson?: Lesson | null
) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [prevLesson, setPrevLesson] = useState<Lesson | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      // Check for admin role in user metadata first (faster)
      if (user?.app_metadata?.role === 'admin') {
        setIsAdmin(true);
        return;
      }
      
      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });
        
        if (error) throw error;
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  // Helper function to check if the user is enrolled in the course
  const checkIfEnrolled = async () => {
    if (!user || !courseId) return false;
    
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();
        
      if (error) return false;
      return !!data;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (currentLesson) {
      setLesson(currentLesson);
      setIsLoading(false);
    }
    
    if (!courseId || !lessonId) return;

    const fetchLessonData = async () => {
      setIsLoading(true);
      try {
        // Fetch current lesson if not provided
        if (!currentLesson) {
          const { data: lessonData, error: lessonError } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .eq('course_id', courseId)
            .single();

          if (lessonError) throw lessonError;
          setLesson(lessonData);
        }

        // Record that the user accessed this lesson (skip for admins if not enrolled)
        if (user && (!isAdmin || (isAdmin && await checkIfEnrolled()))) {
          await supabase.from('progress').upsert({
            user_id: user.id,
            lesson_id: lessonId,
            course_id: courseId,
            last_accessed_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,lesson_id,course_id'
          });
        }

        // Fetch next and previous lessons
        const { data: allLessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, title, sort_order, description, video_url')
          .eq('course_id', courseId)
          .eq('is_published', true)
          .order('sort_order', { ascending: true });

        if (lessonsError) throw lessonsError;

        if (allLessons && allLessons.length > 0) {
          const currentIndex = allLessons.findIndex(l => l.id === lessonId);
          
          if (currentIndex > 0) {
            // Get previous lesson
            setPrevLesson(allLessons[currentIndex - 1]);
          }

          if (currentIndex < allLessons.length - 1) {
            // Get next lesson
            setNextLesson(allLessons[currentIndex + 1]);
          }
        }
        
        // Fetch attachments for the lesson
        const { data: attachmentsData, error: attachmentsError } = await supabase
          .from('lesson_attachments')
          .select('*')
          .eq('lesson_id', lessonId);
          
        if (attachmentsError) throw attachmentsError;
        
        // Make sure we're setting the correct type for attachments
        if (attachmentsData) {
          setAttachments(attachmentsData as Attachment[]);
        }
      } catch (error: any) {
        toast({
          title: "Error loading lesson",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessonData();
  }, [courseId, lessonId, user, currentLesson, isAdmin]);

  return {
    lesson,
    nextLesson,
    prevLesson,
    attachments,
    isLoading,
    isAdmin
  };
};
