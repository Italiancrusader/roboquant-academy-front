
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
}

interface CourseModuleProps {
  title: string;
  lessons: Lesson[];
  courseId: string;
  currentLessonId?: string;
  completedLessons?: Record<string, boolean>;
  durationMinutes?: number | null;
}

const CourseModule: React.FC<CourseModuleProps> = ({
  title,
  lessons,
  courseId,
  currentLessonId,
  completedLessons = {},
  durationMinutes
}) => {
  const [isExpanded, setIsExpanded] = useState(lessons.some(lesson => lesson.id === currentLessonId));
  
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };
  
  const totalLessons = lessons.length;
  const completedCount = lessons.filter(lesson => completedLessons[lesson.id]).length;
  
  return (
    <div className="rounded-md overflow-hidden border border-border">
      <div 
        className="flex items-center justify-between cursor-pointer bg-muted/30 px-4 py-3"
        onClick={handleToggle}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate" title={title}>
            {title}
          </h3>
          <div className="flex items-center text-xs text-muted-foreground mt-0.5">
            <span>{completedCount}/{totalLessons} lessons</span>
            {durationMinutes && durationMinutes > 0 && (
              <>
                <span className="mx-1">•</span>
                <span>{durationMinutes} min</span>
              </>
            )}
          </div>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
      </div>
      
      {isExpanded && (
        <div className="bg-background">
          {lessons.map((lesson) => {
            const isCompleted = completedLessons[lesson.id];
            const isActive = lesson.id === currentLessonId;
            
            return (
              <Link
                key={lesson.id}
                to={`/courses/${courseId}/lessons/${lesson.id}`}
                className={cn(
                  "flex items-center px-4 py-3 border-t border-border group",
                  isActive && "bg-primary/10",
                  !isActive && "hover:bg-muted/40"
                )}
              >
                <div className="w-5 h-5 mr-3 flex-shrink-0 flex items-center justify-center">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      isActive ? "bg-primary" : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
                    )} />
                  )}
                </div>
                <span className="truncate text-sm" title={lesson.title}>
                  {lesson.title}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseModule;
