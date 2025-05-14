
import React from 'react';
import { Card } from '@/components/ui/card';
import { Book, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VimeoPlayer } from '@/components/vimeo';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface LessonContentProps {
  title: string;
  description: string | null;
  videoUrl: string | null;
  isCompleted?: boolean;
}

const LessonContent: React.FC<LessonContentProps> = ({
  title,
  description,
  videoUrl,
  isCompleted = false
}) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold mb-2 break-words">{title}</h1>
          {description && (
            <p className="text-muted-foreground break-words">{description}</p>
          )}
        </div>
        {isCompleted && (
          <div className="flex items-center text-green-500 flex-shrink-0 ml-2">
            <CheckCircle className="h-5 w-5 mr-1.5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        )}
      </div>

      {videoUrl ? (
        <div className="mt-6">
          <AspectRatio ratio={16/9}>
            <VimeoPlayer videoUrl={videoUrl} />
          </AspectRatio>
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
