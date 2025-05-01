
import React from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book } from 'lucide-react';
import { useLesson } from '@/hooks/useLesson';
import LessonContent from '@/components/course/LessonContent';
import LessonNavigation from '@/components/course/LessonNavigation';
import LessonTabs from '@/components/course/LessonTabs';

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
  const { lesson, nextLesson, prevLesson, attachments, isLoading } = useLesson(courseId, lessonId, currentLesson);

  const handleLessonComplete = () => {
    // Navigate to next lesson if available
    if (nextLesson) {
      window.location.href = `/courses/${courseId}/lessons/${nextLesson.id}`;
    }
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
      />

      {lesson.video_url && (
        <VideoPlayer 
          lessonId={lesson.id} 
          courseId={courseId || ''} 
          videoUrl={lesson.video_url} 
          onComplete={handleLessonComplete}
        />
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
    </div>
  );
};

export default LessonView;
