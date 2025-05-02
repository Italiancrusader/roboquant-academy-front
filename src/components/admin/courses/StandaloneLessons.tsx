
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Edit, Trash, Plus } from 'lucide-react';
import { Lesson } from '@/types/courses';

interface StandaloneLessonsProps {
  isActive: boolean;
  lessons: Lesson[];
  onToggle: () => void;
  onAddLesson: () => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onMoveLesson: (lessonId: string, direction: 'up' | 'down', moduleId: string | null) => void;
}

const StandaloneLessons: React.FC<StandaloneLessonsProps> = ({
  isActive,
  lessons,
  onToggle,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onMoveLesson,
}) => {
  const standaloneLessons = lessons
    .filter(lesson => lesson.module_id === null)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="border rounded-md">
      <div className="flex justify-between items-center p-3 bg-muted/30">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onToggle}>
          <span className="font-medium">Standalone Lessons</span>
        </div>
      </div>
      
      {isActive && (
        <div className="p-3 border-t">
          <div className="space-y-2">
            {standaloneLessons.map((lesson, index) => (
              <div 
                key={lesson.id} 
                className="flex justify-between items-center p-2 border rounded-sm bg-background"
              >
                <div className="flex-1">
                  <div className="font-medium">{lesson.title}</div>
                  {lesson.video_url && (
                    <div className="text-xs text-muted-foreground">Video attached</div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onMoveLesson(lesson.id || '', 'up', null)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onMoveLesson(lesson.id || '', 'down', null)}
                    disabled={index === standaloneLessons.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEditLesson(lesson)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDeleteLesson(lesson.id || '')}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={onAddLesson}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Standalone Lesson
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandaloneLessons;
