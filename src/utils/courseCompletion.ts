
/**
 * Utility functions for tracking and handling course completion
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * Checks if a user has completed all lessons in a course
 */
export const checkCourseCompletion = async (userId: string, courseId: string): Promise<boolean> => {
  try {
    // Get all published lessons for this course
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .eq('is_published', true);

    if (lessonsError) throw lessonsError;
    
    if (!lessons || lessons.length === 0) return false;
    
    // Get all completed lessons for this user and course
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('lesson_id, completed')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('completed', true);
    
    if (progressError) throw progressError;
    
    // No progress data means the course is not completed
    if (!progress || progress.length === 0) return false;
    
    // Calculate completion rate
    const completedLessonIds = progress.map(p => p.lesson_id);
    const completionRate = completedLessonIds.length / lessons.length;
    
    // If all lessons are completed, return true
    return completionRate === 1;
  } catch (error: any) {
    console.error('Error checking course completion:', error);
    return false;
  }
};

/**
 * Marks a course as completed and triggers the completion email
 */
export const markCourseAsCompleted = async (userId: string, courseId: string): Promise<boolean> => {
  try {
    // Check if the user has completed all lessons
    const isCompleted = await checkCourseCompletion(userId, courseId);
    
    if (!isCompleted) {
      return false;
    }
    
    // Send the course completion email via edge function
    const { data, error } = await supabase.functions.invoke('course-completion', {
      body: { userId, courseId }
    });
    
    if (error) throw error;
    
    toast({
      title: "Course completed!",
      description: "Congratulations! You've completed the course. A certificate has been sent to your email.",
    });
    
    return true;
  } catch (error: any) {
    console.error('Error marking course as completed:', error);
    toast({
      title: "Error",
      description: "Failed to process course completion. Please try again later.",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Listener for tracking lesson completion and triggering course completion checks
 */
export const handleLessonCompleted = async (userId: string, courseId: string, lessonId: string): Promise<void> => {
  try {
    // Update the progress for this lesson
    const { error: updateError } = await supabase
      .from('progress')
      .upsert({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        completed: true,
        last_accessed_at: new Date().toISOString()
      });
    
    if (updateError) throw updateError;
    
    // Check if the course is now completed
    const courseCompleted = await checkCourseCompletion(userId, courseId);
    
    if (courseCompleted) {
      await markCourseAsCompleted(userId, courseId);
    }
  } catch (error: any) {
    console.error('Error handling lesson completion:', error);
  }
};
