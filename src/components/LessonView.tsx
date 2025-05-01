
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import VideoPlayer from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Book, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Attachment {
  id: string;
  name: string;
  file_url: string;
  type: string;
}

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
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [prevLesson, setPrevLesson] = useState<Lesson | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentLesson) {
      setLesson(currentLesson);
      setIsLoading(false);
    }
    
    if (!courseId || !lessonId) return;

    const fetchLessonData = async () => {
      setIsLoading(true);
      try {
        // Fetch current lesson if not provided
        if (!currentLesson) {
          const { data: lessonData, error: lessonError } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .eq('course_id', courseId)
            .single();

          if (lessonError) throw lessonError;
          setLesson(lessonData);
        }

        // Record that the user accessed this lesson
        if (user) {
          await supabase.from('progress').upsert({
            user_id: user.id,
            lesson_id: lessonId,
            course_id: courseId,
            last_accessed_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,lesson_id,course_id'
          });
        }

        // Fetch next and previous lessons
        const { data: allLessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, title, sort_order, description, video_url')
          .eq('course_id', courseId)
          .eq('is_published', true)
          .order('sort_order', { ascending: true });

        if (lessonsError) throw lessonsError;

        if (allLessons && allLessons.length > 0) {
          const currentIndex = allLessons.findIndex(l => l.id === lessonId);
          
          if (currentIndex > 0) {
            // Get previous lesson
            setPrevLesson(allLessons[currentIndex - 1]);
          }

          if (currentIndex < allLessons.length - 1) {
            // Get next lesson
            setNextLesson(allLessons[currentIndex + 1]);
          }
        }
        
        // Fetch attachments for the lesson
        const { data: attachmentsData, error: attachmentsError } = await supabase
          .from('lesson_attachments')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('created_at', { ascending: true });
          
        if (attachmentsError) throw attachmentsError;
        setAttachments(attachmentsData || []);
      } catch (error: any) {
        toast({
          title: "Error loading lesson",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessonData();
  }, [courseId, lessonId, user, currentLesson]);

  const handleLessonComplete = () => {
    // Navigate to next lesson if available
    if (nextLesson) {
      navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
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
      <div>
        <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-muted-foreground">{lesson.description}</p>
        )}
      </div>

      {lesson.video_url ? (
        <VideoPlayer 
          lessonId={lesson.id} 
          courseId={courseId || ''} 
          videoUrl={lesson.video_url} 
          onComplete={handleLessonComplete}
        />
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Book className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">This lesson does not contain a video.</p>
          </div>
        </Card>
      )}
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="resources" className="relative">
            Resources
            {attachments.length > 0 && (
              <span className="absolute top-0 right-1 transform translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {attachments.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="pt-4">
          <div className="prose prose-invert max-w-none">
            {lesson.description ? (
              <div>
                <h2>Description</h2>
                <p>{lesson.description}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No additional details available for this lesson.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="resources" className="pt-4">
          {attachments.length > 0 ? (
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <a 
                  key={attachment.id} 
                  href={attachment.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border rounded-lg hover:bg-muted transition-colors"
                >
                  <FileText className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">{attachment.type}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No resources available for this lesson.</p>
          )}
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex justify-between">
        {prevLesson ? (
          <Button variant="outline" onClick={() => navigate(`/courses/${courseId}/lessons/${prevLesson.id}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous: {prevLesson.title}
          </Button>
        ) : (
          <div></div>
        )}
        
        {nextLesson ? (
          <Button onClick={() => navigate(`/courses/${courseId}/lessons/${nextLesson.id}`)}>
            Next: {nextLesson.title}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => navigate(`/courses/${courseId}`)}>
            Back to Course
          </Button>
        )}
      </div>
    </div>
  );
};

export default LessonView;
