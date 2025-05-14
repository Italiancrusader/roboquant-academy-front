
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseVideoProgressProps {
  lessonId: string;
  courseId: string;
  videoUrl: string | null;
  onComplete?: () => void;
}

export const useVideoProgress = ({
  lessonId,
  courseId,
  videoUrl,
  onComplete,
}: UseVideoProgressProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  useEffect(() => {
    // Skip progress tracking for admin if no onComplete handler
    if (isAdmin && !onComplete) return;
    
    const loadProgress = async () => {
      if (!user || !lessonId || !videoUrl) return;

      try {
        const { data, error } = await supabase
          .from('progress')
          .select('completed, last_position_seconds')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .eq('course_id', courseId)
          .single();
          
        if (error) {
          // Only log the error if it's not "no rows returned"
          if (error.code !== 'PGRST116') {
            console.error('Error loading progress:', error);
          }
          return;
        }
        
        if (data) {
          setCurrentTime(data.last_position_seconds || 0);
          setCompleted(data.completed || false);
          
          // If the video is marked as completed, trigger onComplete
          if (data.completed && onComplete && !isAdmin) {
            onComplete();
          }
        }
      } catch (error) {
        console.error('Error in loadProgress:', error);
      }
    };
    
    loadProgress();
  }, [user, lessonId, videoUrl, courseId, onComplete, isAdmin]);
  
  // Save the current time periodically
  useEffect(() => {
    // Skip saving progress if admin (unless onComplete is provided)
    if (isAdmin && !onComplete) return;
    
    // Don't save progress if video is already marked as completed
    if (completed) return;
    
    const saveCurrentTime = async () => {
      if (!user || !lessonId || !courseId) return;
      
      try {
        // Calculate completion percentage
        const completionPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
        // Mark as completed if watched more than 90%
        const isCompleted = completionPercentage >= 90;
        
        const progressData = {
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          last_position_seconds: Math.floor(currentTime),
          completed: isCompleted,
          last_accessed_at: new Date().toISOString()
        };
        
        // Using upsert with the unique constraint
        const { error } = await supabase
          .from('progress')
          .upsert(progressData, { 
            onConflict: 'user_id,lesson_id,course_id'
          });

        if (error) {
          console.error('Error saving progress:', error);
          return;
        }

        // If just completed and has onComplete callback
        if (isCompleted && !completed && onComplete) {
          setCompleted(true);
          onComplete();
        }

        // Update local state if completed
        if (isCompleted && !completed) {
          setCompleted(true);
        }
      } catch (error) {
        console.error('Error in saveCurrentTime:', error);
      }
    };
    
    // Save progress every 10 seconds
    const interval = setInterval(saveCurrentTime, 10000);
    
    return () => {
      clearInterval(interval);
      // Save once when unmounting
      saveCurrentTime();
    };
  }, [user, lessonId, courseId, currentTime, duration, completed, onComplete, isAdmin]);

  return {
    currentTime,
    duration,
    completed,
    isAdmin,
    setCurrentTime,
    setDuration,
    setCompleted
  };
};
