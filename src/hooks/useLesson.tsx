
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
        .eq('user_id', user.id as any)
        .eq('course_id', courseId as any)
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
            .eq('id', lessonId as any)
            .eq('course_id', courseId as any)
            .single();

          if (lessonError) throw lessonError;
          
          if (lessonData) {
            const typedLesson: Lesson = {
              id: lessonData.id || '',
              title: lessonData.title || '',
              description: lessonData.description,
              video_url: lessonData.video_url,
              sort_order: lessonData.sort_order || 0
            };
            setLesson(typedLesson);
          }
        }

        // Record that the user accessed this lesson (skip for admins if not enrolled)
        if (user && (!isAdmin || (isAdmin && await checkIfEnrolled()))) {
          try {
            // First check if a record exists
            const { data: existingProgress } = await supabase
              .from('progress')
              .select('id')
              .eq('user_id', user.id as any)
              .eq('lesson_id', lessonId as any)
              .eq('course_id', courseId as any);
            
            if (!existingProgress || existingProgress.length === 0) {
              // Insert new record with all required fields
              await supabase
                .from('progress')
                .insert({
                  user_id: user.id,
                  lesson_id: lessonId,
                  course_id: courseId,
                  last_accessed_at: new Date().toISOString(),
                  last_position_seconds: 0,
                  completed: false
                } as any);
            } else {
              // Update existing record - only update the timestamp
              await supabase
                .from('progress')
                .update({ last_accessed_at: new Date().toISOString() } as any)
                .eq('user_id', user.id as any)
                .eq('lesson_id', lessonId as any)
                .eq('course_id', courseId as any);
            }
          } catch (progressError) {
            // Only log the error without showing a toast
            console.error('Error updating progress:', progressError);
          }
        }

        // Fetch next and previous lessons
        const { data: allLessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, title, sort_order, description, video_url')
          .eq('course_id', courseId as any)
          .eq('is_published', true as any)
          .order('sort_order', { ascending: true });

        if (lessonsError) throw lessonsError;

        if (allLessons && allLessons.length > 0) {
          const currentIndex = allLessons.findIndex(l => l.id === lessonId);
          
          if (currentIndex > 0) {
            // Get previous lesson
            const prevLessonData = allLessons[currentIndex - 1];
            if (prevLessonData) {
              setPrevLesson({
                id: prevLessonData.id || '',
                title: prevLessonData.title || '',
                description: prevLessonData.description,
                video_url: prevLessonData.video_url,
                sort_order: prevLessonData.sort_order || 0
              });
            } else {
              setPrevLesson(null);
            }
          } else {
            setPrevLesson(null);
          }

          if (currentIndex < allLessons.length - 1) {
            // Get next lesson
            const nextLessonData = allLessons[currentIndex + 1];
            if (nextLessonData) {
              setNextLesson({
                id: nextLessonData.id || '',
                title: nextLessonData.title || '',
                description: nextLessonData.description,
                video_url: nextLessonData.video_url,
                sort_order: nextLessonData.sort_order || 0
              });
            } else {
              setNextLesson(null);
            }
          } else {
            setNextLesson(null);
          }
        }
        
        // Fetch attachments for the lesson
        const { data: attachmentsData, error: attachmentsError } = await supabase
          .from('lesson_attachments')
          .select('*')
          .eq('lesson_id', lessonId as any);
          
        if (attachmentsError) throw attachmentsError;
        
        // Make sure we're setting the correct type for attachments
        if (attachmentsData) {
          const typedAttachments: Attachment[] = attachmentsData.map(attachment => ({
            id: attachment.id || '',
            name: attachment.name || '',
            file_url: attachment.file_url || '',
            type: attachment.type || ''
          }));
          setAttachments(typedAttachments);
        } else {
          setAttachments([]);
        }
      } catch (error: any) {
        console.error('Error loading lesson:', error);
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
