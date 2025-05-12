
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
}

interface LessonNavigationProps {
  courseId: string | undefined;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
}

const LessonNavigation: React.FC<LessonNavigationProps> = ({
  courseId, 
  prevLesson,
  nextLesson
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between mt-8 border-t pt-6">
      {prevLesson ? (
        <Button 
          variant="outline" 
          onClick={() => navigate(`/courses/${courseId}/lessons/${prevLesson.id}`)}
          className="flex items-center max-w-[45%]"
          title={`Previous: ${prevLesson.title}`}
        >
          <ChevronLeft className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">Previous: {prevLesson.title}</span>
        </Button>
      ) : (
        <div></div>
      )}
      
      {nextLesson ? (
        <Button 
          onClick={() => navigate(`/courses/${courseId}/lessons/${nextLesson.id}`)}
          className="flex items-center max-w-[45%]"
          title={`Next: ${nextLesson.title}`}
        >
          <span className="truncate">Next: {nextLesson.title}</span>
          <ChevronRight className="ml-2 h-4 w-4 flex-shrink-0" />
        </Button>
      ) : (
        <Button onClick={() => navigate(`/courses/${courseId}`)}>
          Back to Course
        </Button>
      )}
    </div>
  );
};

export default LessonNavigation;
