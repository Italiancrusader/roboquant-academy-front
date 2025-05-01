
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
  );
};

export default LessonNavigation;
