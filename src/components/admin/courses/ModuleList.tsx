
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import { Module, Lesson } from '@/types/courses';
import ModuleItem from './ModuleItem';
import StandaloneLessons from './StandaloneLessons';
import ModuleDialogs from './ModuleDialogs';
import { deleteModule, deleteLesson, moveModule, moveLesson } from '@/services/courseModuleService';

interface ModuleListProps {
  courseId: string;
  modules: Module[];
  lessons: Lesson[];
  onRefresh: () => void;
}

const ModuleList = ({ courseId, modules, lessons, onRefresh }: ModuleListProps) => {
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | undefined>(undefined);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | undefined>(undefined);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  
  const toggleModule = (moduleId: string) => {
    setActiveModuleId(activeModuleId === moduleId ? null : moduleId);
  };
  
  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setIsModuleDialogOpen(true);
  };
  
  const handleAddLessonToModule = (moduleId: string) => {
    setSelectedLesson({
      title: '',
      course_id: courseId,
      module_id: moduleId
    } as Lesson);
    setIsLessonDialogOpen(true);
  };
  
  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsLessonDialogOpen(true);
  };
  
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) {
      return;
    }
    
    const success = await deleteModule(moduleId);
    if (success) {
      onRefresh();
    }
  };
  
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }
    
    const success = await deleteLesson(lessonId);
    if (success) {
      onRefresh();
    }
  };
  
  const handleMoveModule = async (moduleId: string, direction: 'up' | 'down') => {
    const success = await moveModule(modules, moduleId, direction);
    if (success) {
      onRefresh();
    }
  };
  
  const handleMoveLesson = async (lessonId: string, direction: 'up' | 'down', moduleId: string | null) => {
    const success = await moveLesson(lessons, lessonId, direction, moduleId);
    if (success) {
      onRefresh();
    }
  };
  
  const handleAddStandaloneLesson = () => {
    setSelectedLesson({
      title: '',
      course_id: courseId,
      module_id: null
    } as Lesson);
    setIsLessonDialogOpen(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Course Structure</h3>
        <Button 
          onClick={() => { 
            setSelectedModule(undefined); 
            setIsModuleDialogOpen(true); 
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>
      
      <div className="space-y-2 mt-4">
        {modules.length === 0 ? (
          <div className="text-center p-6 border rounded-md bg-muted/10">
            <p className="text-muted-foreground mb-4">
              No modules yet. Add your first module to organize your course content.
            </p>
            <Button 
              onClick={() => { 
                setSelectedModule(undefined); 
                setIsModuleDialogOpen(true); 
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Module
            </Button>
          </div>
        ) : (
          modules.map((module, index) => (
            <ModuleItem
              key={module.id}
              module={module}
              isActive={activeModuleId === module.id}
              isFirst={index === 0}
              isLast={index === modules.length - 1}
              lessons={lessons}
              onToggle={() => toggleModule(module.id)}
              onEdit={handleEditModule}
              onDelete={handleDeleteModule}
              onMove={handleMoveModule}
              onAddLesson={handleAddLessonToModule}
              onEditLesson={handleEditLesson}
              onDeleteLesson={handleDeleteLesson}
              onMoveLesson={handleMoveLesson}
            />
          ))
        )}
        
        <StandaloneLessons
          isActive={activeModuleId === 'standalone'}
          lessons={lessons}
          onToggle={() => toggleModule('standalone')}
          onAddLesson={handleAddStandaloneLesson}
          onEditLesson={handleEditLesson}
          onDeleteLesson={handleDeleteLesson}
          onMoveLesson={handleMoveLesson}
        />
      </div>
      
      <ModuleDialogs
        courseId={courseId}
        isModuleDialogOpen={isModuleDialogOpen}
        setIsModuleDialogOpen={setIsModuleDialogOpen}
        isLessonDialogOpen={isLessonDialogOpen}
        setIsLessonDialogOpen={setIsLessonDialogOpen}
        selectedModule={selectedModule}
        selectedLesson={selectedLesson}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default ModuleList;
