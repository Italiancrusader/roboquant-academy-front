
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Play, Pause, RotateCcw, Loader, AlertCircle } from 'lucide-react';
import VimeoPlayer from './VimeoPlayer';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VideoPlayerProps {
  lessonId: string;
  courseId: string;
  videoUrl: string;
  onComplete?: () => void;
}

// Helper function to determine if a URL is a Vimeo URL
const isVimeoUrl = (url: string): boolean => {
  return url.includes('vimeo.com');
};

// Helper function to validate IDs
const isValidUUID = (id: string): boolean => {
  // Basic UUID validation - checks if it's not a "preview" string and has proper UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  lessonId, 
  courseId, 
  videoUrl,
  onComplete
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressSaved, setProgressSaved] = useState(false);
  const { user } = useAuth();
  
  // Determine if this is a Vimeo video
  const isVimeo = isVimeoUrl(videoUrl);
  
  // Check if this is a preview lesson (don't save progress for previews)
  const isPreviewLesson = !isValidUUID(lessonId) || !isValidUUID(courseId);
  
  // Calculate progress percentage
  const progressPercentage = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.app_metadata?.provider === 'admin';
  
  // Load saved progress on component mount
  useEffect(() => {
    if (!user || !lessonId || isPreviewLesson || isAdmin) return;
    
    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('progress')
          .select('last_position_seconds, completed')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .eq('course_id', courseId)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          // Set the video to the last position
          if (videoRef.current && data.last_position_seconds && !isVimeo) {
            videoRef.current.currentTime = data.last_position_seconds;
            setCurrentTime(data.last_position_seconds);
          }
          
          setProgressSaved(data.completed || false);
        }
      } catch (error: any) {
        console.error("Error loading progress:", error.message);
      }
    };
    
    fetchProgress();
  }, [user, lessonId, courseId, isVimeo, isPreviewLesson, isAdmin]);
  
  // Update progress in Supabase
  const saveProgress = async (position: number, completed: boolean = false) => {
    if (!user || !lessonId || !courseId || isPreviewLesson || isAdmin) return;
    
    try {
      // Validate all fields to prevent 400 errors
      if (!isValidUUID(user.id) || !isValidUUID(lessonId) || !isValidUUID(courseId)) {
        console.error("Invalid IDs detected, skipping progress save", {
          userId: user.id,
          lessonId,
          courseId
        });
        return;
      }

      // First check if record exists
      const { data: existingRecords } = await supabase
        .from('progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .eq('course_id', courseId);
      
      const progressData = {
        user_id: user.id,
        lesson_id: lessonId,
        course_id: courseId,
        last_position_seconds: Math.floor(position),
        completed: completed,
        last_accessed_at: new Date().toISOString()
      };
      
      if (existingRecords && existingRecords.length > 0) {
        // Update existing record
        await supabase
          .from('progress')
          .update(progressData)
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .eq('course_id', courseId);
      } else {
        // Insert new record
        await supabase
          .from('progress')
          .insert(progressData);
      }
      
      if (completed && !progressSaved) {
        setProgressSaved(true);
        toast({
          title: "Lesson completed!",
          description: "Your progress has been saved.",
        });
        if (onComplete) onComplete();
      }
    } catch (error: any) {
      console.error("Error saving progress:", error.message);
    }
  };
  
  // Handle timeupdate event to track progress for HTML5 video
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentVideoTime = videoRef.current.currentTime;
      setCurrentTime(currentVideoTime);
      
      // Only save progress for non-preview lessons and non-admin users
      if (!isPreviewLesson && !isAdmin) {
        // Save progress every 10 seconds
        if (Math.round(currentVideoTime) % 10 === 0) {
          saveProgress(currentVideoTime);
        }
        
        // Mark as completed when reaching 90% of the video
        const completionThreshold = duration * 0.9;
        if (currentVideoTime >= completionThreshold && !progressSaved) {
          saveProgress(currentVideoTime, true);
        }
      }
    }
  };
  
  // Handle time updates from Vimeo player
  const handleVimeoTimeUpdate = (currentVideoTime: number) => {
    setCurrentTime(currentVideoTime);
    
    // Only save progress for non-preview lessons and non-admin users
    if (!isPreviewLesson && !isAdmin) {
      // Save progress every 10 seconds
      if (Math.round(currentVideoTime) % 10 === 0) {
        saveProgress(currentVideoTime);
      }
      
      // Mark as completed when reaching 90% of the video
      const completionThreshold = duration * 0.9;
      if (currentVideoTime >= completionThreshold && !progressSaved) {
        saveProgress(currentVideoTime, true);
      }
    }
  };
  
  // Handle video complete for Vimeo
  const handleVimeoComplete = () => {
    if (!isPreviewLesson && !isAdmin) {
      saveProgress(duration, true);
    }
  };
  
  // Handle duration change for Vimeo
  const handleVimeoDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    setLoading(false);
  };
  
  // Handle video metadata loaded for HTML5 video
  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setLoading(false);
    }
  };
  
  // Play/pause toggle for HTML5 video
  const togglePlay = () => {
    if (!isVimeo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Restart video for HTML5 video
  const restartVideo = () => {
    if (!isVimeo && videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Handle video errors
  const handleVideoError = () => {
    setError("Unable to load video. The video might be private or unavailable.");
    setLoading(false);
  };

  return (
    <div className="w-full bg-background rounded-lg overflow-hidden border">
      {isVimeo ? (
        <VimeoPlayer 
          videoUrl={videoUrl} 
          onComplete={isPreviewLesson || isAdmin ? undefined : handleVimeoComplete}
          onTimeUpdate={isPreviewLesson || isAdmin ? undefined : handleVimeoTimeUpdate}
          onDurationChange={handleVimeoDurationChange}
          autoplay={isAdmin}
        />
      ) : (
        <div className="relative aspect-video bg-black">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader className="h-10 w-10 text-primary animate-spin" />
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
              <AlertCircle className="h-10 w-10 text-red-400 mb-2" />
              <p>{error}</p>
            </div>
          )}
          
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleMetadataLoaded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={handleVideoError}
            onEnded={() => {
              setIsPlaying(false);
              if (!isPreviewLesson && !isAdmin) {
                saveProgress(duration, true);
              }
            }}
          />
        </div>
      )}
      
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          {!isVimeo && (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={togglePlay}
                disabled={loading || !!error}
                className="h-8 w-8"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={restartVideo}
                disabled={loading || !!error}
                className="h-8 w-8"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <div className="flex flex-col w-full gap-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            <Progress 
              value={progressPercentage} 
              className={cn(
                "h-2",
                progressSaved ? "bg-green-500" : ""
              )}
            />
          </div>
          
          {progressSaved && !isAdmin && (
            <div className="flex items-center text-green-500">
              <span className="text-xs font-medium">Completed</span>
            </div>
          )}
        </div>
        
        {isAdmin && (
          <div className="mt-2">
            <p className="text-xs text-amber-500">Admin mode: Progress tracking is disabled</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
