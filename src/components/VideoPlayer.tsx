
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Play, Pause, RotateCcw, Loader } from 'lucide-react';

interface VideoPlayerProps {
  lessonId: string;
  courseId: string;
  videoUrl: string;
  onComplete?: () => void;
}

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
  const [progressSaved, setProgressSaved] = useState(false);
  const { user } = useAuth();

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
  
  // Load saved progress on component mount
  useEffect(() => {
    if (!user || !lessonId) return;
    
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
          if (videoRef.current && data.last_position_seconds) {
            videoRef.current.currentTime = data.last_position_seconds;
            setCurrentTime(data.last_position_seconds);
          }
          
          setProgressSaved(data.completed || false);
        }
      } catch (error: any) {
        toast({
          title: "Error loading progress",
          description: error.message,
          variant: "destructive",
        });
      }
    };
    
    fetchProgress();
  }, [user, lessonId, courseId]);
  
  // Update progress in Supabase
  const saveProgress = async (position: number, completed: boolean = false) => {
    if (!user || !lessonId) return;
    
    try {
      const { error } = await supabase
        .from('progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          last_position_seconds: position,
          completed: completed,
          last_accessed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id,course_id'
        });
      
      if (error) throw error;
      
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
  
  // Handle timeupdate event to track progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentVideoTime = videoRef.current.currentTime;
      setCurrentTime(currentVideoTime);
      
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
  
  // Handle video metadata loaded
  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setLoading(false);
    }
  };
  
  // Play/pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Restart video
  const restartVideo = () => {
    if (videoRef.current) {
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

  return (
    <div className="w-full bg-background rounded-lg overflow-hidden border">
      <div className="relative aspect-video bg-black">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader className="h-10 w-10 text-primary animate-spin" />
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
          onEnded={() => {
            setIsPlaying(false);
            saveProgress(duration, true);
          }}
        />
      </div>
      
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={togglePlay}
            disabled={loading}
            className="h-8 w-8"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={restartVideo}
            disabled={loading}
            className="h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <span className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          
          <div className="flex-1">
            <Progress value={progressPercentage} />
          </div>
          
          {progressSaved && (
            <span className="text-xs text-green-500 font-medium">Completed</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
