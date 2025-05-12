
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import VimeoPlayer from './VimeoPlayer';
import { toast } from '@/components/ui/use-toast';

interface VideoPlayerProps {
  videoUrl: string | null;
  lessonId: string;
  courseId: string;
  onComplete?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  lessonId,
  courseId,
  onComplete,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
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
    
    // Don't save progress if there was a video error
    if (videoError) return;
    
    const saveCurrentTime = async () => {
      if (!user || !lessonId || !courseId) return;
      
      try {
        // Calculate completion percentage
        const completionPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
        // Mark as completed if watched more than 90%
        const isCompleted = completionPercentage >= 90;
        
        // First try to update existing record
        const { error } = await supabase
          .from('progress')
          .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            course_id: courseId,
            last_position_seconds: Math.floor(currentTime),
            completed: isCompleted,
            last_accessed_at: new Date().toISOString()
          }, {
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
  }, [user, lessonId, courseId, currentTime, duration, completed, onComplete, isAdmin, videoError]);
  
  if (!videoUrl) {
    return null;
  }
  
  const handleError = (message: string) => {
    console.error("Video player error:", message);
    setVideoError(message);
    
    // Show a toast for the error
    toast({
      title: "Video Error",
      description: message,
      variant: "destructive",
    });
  };
  
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };
  
  const handleDurationChange = (videoDuration: number) => {
    setDuration(videoDuration);
  };
  
  const handleComplete = () => {
    if (onComplete && !isAdmin) {
      onComplete();
    }
  };
  
  return (
    <VimeoPlayer 
      videoUrl={videoUrl} 
      controls={true}
      onComplete={handleComplete}
      onTimeUpdate={handleTimeUpdate}
      onDurationChange={handleDurationChange}
      onError={handleError}
    />
  );
};

export default VideoPlayer;
