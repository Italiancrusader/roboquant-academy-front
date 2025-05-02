
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Edit, Trash, Plus } from 'lucide-react';
import { Module, Lesson } from '@/types/courses';

interface ModuleItemProps {
  module: Module;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  lessons: Lesson[];
  onToggle: () => void;
  onEdit: (module: Module) => void;
  onDelete: (moduleId: string) => void;
  onMove: (moduleId: string, direction: 'up' | 'down') => void;
  onAddLesson: (moduleId: string) => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onMoveLesson: (lessonId: string, direction: 'up' | 'down', moduleId: string | null) => void;
}

const ModuleItem: React.FC<ModuleItemProps> = ({
  module,
  isActive,
  isFirst,
  isLast,
  lessons,
  onToggle,
  onEdit,
  onDelete,
  onMove,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onMoveLesson,
}) => {
  const moduleLessons = lessons
    .filter(lesson => lesson.module_id === module.id)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="border rounded-md">
      <div className="flex justify-between items-center p-3 bg-muted/30">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onToggle}>
          <span className="font-medium">{module.title}</span>
          <span className="text-xs text-muted-foreground">({moduleLessons.length} lessons)</span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onMove(module.id, 'up')}
            disabled={isFirst}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onMove(module.id, 'down')}
            disabled={isLast}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(module)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(module.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isActive && (
        <div className="p-3 border-t">
          <div className="space-y-2">
            {moduleLessons.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-sm text-muted-foreground mb-2">No lessons in this module yet</p>
              </div>
            ) : (
              moduleLessons.map((lesson, index) => (
                <LessonItem 
                  key={lesson.id}
                  lesson={lesson} 
                  isFirst={index === 0}
                  isLast={index === moduleLessons.length - 1}
                  onEdit={onEditLesson}
                  onDelete={onDeleteLesson}
                  onMove={onMoveLesson}
                  moduleId={module.id}
                />
              ))
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={() => onAddLesson(module.id)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson to {module.title}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleItem;

// Also define the LessonItem component used within ModuleItem
interface LessonItemProps {
  lesson: Lesson;
  isFirst: boolean;
  isLast: boolean;
  moduleId: string | null;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lessonId: string) => void;
  onMove: (lessonId: string, direction: 'up' | 'down', moduleId: string | null) => void;
}

const LessonItem: React.FC<LessonItemProps> = ({
  lesson,
  isFirst,
  isLast,
  moduleId,
  onEdit,
  onDelete,
  onMove,
}) => (
  <div className="flex justify-between items-center p-2 border rounded-sm bg-background">
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
        onClick={() => onMove(lesson.id || '', 'up', moduleId)}
        disabled={isFirst}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onMove(lesson.id || '', 'down', moduleId)}
        disabled={isLast}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onEdit(lesson)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onDelete(lesson.id || '')}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  </div>
);
