
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="space-y-2">
      <div 
        className="flex items-center justify-between cursor-pointer bg-secondary/30 rounded-md px-3 py-2 transition-colors hover:bg-secondary/50"
        onClick={handleToggle}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate" title={title}>
            {title}
          </h3>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>{completedCount}/{totalLessons} lessons</span>
            {durationMinutes && (
              <>
                <span className="mx-1">•</span>
                <span>{durationMinutes} min</span>
              </>
            )}
          </div>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </div>
      
      {isExpanded && (
        <div className="space-y-1 pl-3">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              to={`/courses/${courseId}/lessons/${lesson.id}`}
              className={`
                block py-1.5 px-3 text-sm rounded-md truncate
                ${lesson.id === currentLessonId ? 'bg-secondary font-medium' : 'hover:bg-secondary/20'}
              `}
            >
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 flex-shrink-0">
                  {completedLessons[lesson.id] && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <span className="truncate" title={lesson.title}>
                  {lesson.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseModule;
