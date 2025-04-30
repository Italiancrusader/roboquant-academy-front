
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import VideoPlayer from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, Book } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  sort_order: number;
}

// Create a simpler type for navigation between lessons
interface LessonNavigation {
  id: string;
  title: string;
  sort_order: number; // Adding sort_order to match the Lesson interface
  description: string | null; // Adding description to match the Lesson interface
  video_url: string | null; // Adding video_url to match the Lesson interface
}

const LessonView = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [nextLesson, setNextLesson] = useState<LessonNavigation | null>(null);
  const [prevLesson, setPrevLesson] = useState<LessonNavigation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!courseId || !lessonId) return;

    const fetchLessonData = async () => {
      setIsLoading(true);
      try {
        // Fetch current lesson
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .eq('course_id', courseId)
          .single();

        if (lessonError) throw lessonError;
        setLesson(lessonData);

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
  }, [courseId, lessonId, user]);

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

      <div className="prose prose-invert max-w-none">
        {/* Additional lesson content can be added here */}
      </div>

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
