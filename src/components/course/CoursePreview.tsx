
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import { useIsMobile } from '@/hooks/use-mobile';

interface CoursePreviewProps {
  courseTitle: string;
  previewVideoUrl: string | null;
  previewImage: string | null;
}

const CoursePreview: React.FC<CoursePreviewProps> = ({
  courseTitle,
  previewVideoUrl,
  previewImage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  if (!previewVideoUrl) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="relative aspect-video">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 flex items-center justify-center">
              <Button variant="outline" className="rounded-full h-14 w-14 p-0 flex items-center justify-center bg-white/10 backdrop-blur-sm border-white/30 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                <Play className="h-6 w-6 text-white" />
              </Button>
            </div>
            <img 
              src={previewImage || '/placeholder.svg'} 
              alt={`${courseTitle} preview`} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <CardContent className="p-4 bg-gradient-to-r from-blue-primary/20 to-teal-primary/20">
            <p className="text-center font-medium">Watch Free Preview</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className={`${isMobile ? 'w-[95vw]' : 'max-w-3xl'} p-0 overflow-hidden bg-secondary`}>
        <DialogHeader className="p-4">
          <DialogTitle>{courseTitle} - Preview</DialogTitle>
          <DialogDescription>
            Get a taste of what you'll learn in this course.
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video">
          {previewVideoUrl && (
            <VideoPlayer 
              videoUrl={previewVideoUrl} 
              lessonId="preview" 
              courseId="preview"
              onComplete={() => {}}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoursePreview;
