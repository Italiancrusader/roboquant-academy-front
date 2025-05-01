
import React from 'react';
import { Card } from '@/components/ui/card';
import { Book } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';

interface LessonContentProps {
  title: string;
  description: string | null;
  videoUrl: string | null;
  lessonId?: string;
  courseId?: string;
}

const LessonContent: React.FC<LessonContentProps> = ({
  title,
  description,
  videoUrl,
  lessonId = '',
  courseId = ''
}) => {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      {videoUrl ? (
        <div className="mt-6 rounded-lg overflow-hidden border border-border">
          <VideoPlayer 
            videoUrl={videoUrl} 
            lessonId={lessonId} 
            courseId={courseId}
          />
        </div>
      ) : (
        <Card className="p-8 text-center mt-6">
          <div className="flex flex-col items-center space-y-4">
            <Book className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">This lesson does not contain a video.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LessonContent;
