
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, AlertCircle, RefreshCw } from 'lucide-react';
import { useLesson } from '@/hooks/useLesson';
import LessonContent from '@/components/course/LessonContent';
import LessonNavigation from '@/components/course/LessonNavigation';
import LessonTabs from '@/components/course/LessonTabs';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  sort_order: number;
}

interface LessonViewProps {
  currentLesson?: Lesson | null;
}

const LessonView = ({ currentLesson }: LessonViewProps) => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user } = useAuth();
  const { lesson, nextLesson, prevLesson, attachments, isLoading, isAdmin } = useLesson(courseId, lessonId, currentLesson);
  const [videoError, setVideoError] = useState<string | null>(null);
  
  const handleLessonComplete = () => {
    // Show completion toast
    toast({
      title: "Lesson completed!",
      description: "Moving to the next lesson...",
    });
    
    // Navigate to next lesson if available
    if (nextLesson) {
      window.location.href = `/courses/${courseId}/lessons/${nextLesson.id}`;
    }
  };
  
  const handleVideoError = (error: string) => {
    setVideoError(error);
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <Book className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Lesson not found</h2>
          <p className="text-muted-foreground">The lesson you're looking for doesn't exist or you don't have access to it.</p>
          <Button asChild>
            <a href={`/courses/${courseId}`}>Back to Course</a>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <LessonContent 
        title={lesson.title} 
        description={lesson.description}
        videoUrl={lesson.video_url} 
        isCompleted={false}
      />

      {lesson.video_url ? (
        <VideoPlayer 
          lessonId={lesson.id} 
          courseId={courseId || ''} 
          videoUrl={lesson.video_url} 
          onComplete={isAdmin ? undefined : handleLessonComplete}
        />
      ) : (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>No Video Available</AlertTitle>
          <AlertDescription>
            This lesson doesn't include a video.
          </AlertDescription>
        </Alert>
      )}
      
      {videoError && (
        <Alert variant="destructive" className="mt-2">
          <div className="flex justify-between items-start w-full">
            <div className="flex-1">
              <AlertTitle className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Video Error
              </AlertTitle>
              <AlertDescription>
                {videoError}
              </AlertDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshPage} 
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>
        </Alert>
      )}
      
      <LessonTabs 
        description={lesson.description}
        attachments={attachments}
      />

      <Separator />

      <LessonNavigation 
        courseId={courseId}
        prevLesson={prevLesson}
        nextLesson={nextLesson}
      />
      
      {isAdmin && (
        <div className="p-4 mt-4 border rounded-md bg-amber-50">
          <p className="text-sm font-medium text-amber-800">
            Admin Mode: You're viewing this course as an administrator. 
            Progress tracking is disabled and video privacy restrictions are bypassed.
          </p>
        </div>
      )}
    </div>
  );
};

export default LessonView;
