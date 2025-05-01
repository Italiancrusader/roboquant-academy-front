
import React from 'react';
import { Button } from '@/components/ui/button';
import { Circle, CheckCircle2, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number | null;
  has_attachments?: boolean;
}

interface CourseModuleProps {
  title: string;
  lessons: Lesson[];
  courseId: string;
  currentLessonId?: string;
  completedLessons: Record<string, boolean>;
  durationMinutes?: number | null;
}

const CourseModule = ({
  title,
  lessons,
  courseId,
  currentLessonId,
  completedLessons,
  durationMinutes
}: CourseModuleProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{title}</h3>
        {durationMinutes ? (
          <div className="text-sm text-muted-foreground flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {durationMinutes} min
          </div>
        ) : null}
      </div>
      
      <nav className="space-y-1">
        {lessons.map((lesson) => (
          <Button
            key={lesson.id}
            variant="ghost"
            className={cn(
              "w-full justify-start px-2 py-1.5 h-auto text-sm",
              currentLessonId === lesson.id && "bg-muted font-medium",
              completedLessons[lesson.id] && "text-green-400"
            )}
            asChild
          >
            <a href={`/courses/${courseId}/lessons/${lesson.id}`}>
              <div className="mr-2 p-1">
                {completedLessons[lesson.id] ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <div className="flex-grow text-left">
                <div className="line-clamp-1">{lesson.title}</div>
                {lesson.duration_minutes && (
                  <div className="text-xs text-muted-foreground">
                    {lesson.duration_minutes} min
                  </div>
                )}
              </div>
              {lesson.has_attachments && (
                <FileText className="h-4 w-4 text-muted-foreground ml-2" />
              )}
            </a>
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default CourseModule;
