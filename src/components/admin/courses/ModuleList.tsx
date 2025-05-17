
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ModuleItem from './ModuleItem';
import StandaloneLessons from './StandaloneLessons';
import ModuleDialogs from './ModuleDialogs';
import { Module, Lesson } from '@/types/courses';

interface ModuleListProps {
  courseId: string;
  modules: Module[];
  lessons: Lesson[];
  onRefresh: () => void;
}

const ModuleList = ({ courseId, modules, lessons, onRefresh }: ModuleListProps) => {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isStandaloneLessonsActive, setIsStandaloneLessonsActive] = useState(false);
  
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  
  const [selectedModule, setSelectedModule] = useState<Module | undefined>(undefined);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | undefined>(undefined);

  const handleAddModule = () => {
    setSelectedModule(undefined);
    setIsModuleDialogOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setIsModuleDialogOpen(true);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (confirm('Are you sure you want to delete this module? All associated lessons will be deleted.')) {
      try {
        // Get all lessons in the module
        const { data: moduleLessons, error: fetchError } = await supabase
          .from('lessons')
          .select('id')
          .eq('module_id', moduleId as any);
        
        if (fetchError) throw fetchError;
        
        // Delete all lessons in the module
        if (moduleLessons && moduleLessons.length > 0) {
          // Safely extract lesson IDs with type checking
          const lessonIds = moduleLessons
            .filter((lesson): lesson is { id: string } => 
              lesson && typeof lesson === 'object' && 'id' in lesson)
            .map(lesson => lesson.id);
          
          if (lessonIds.length > 0) {
            const { error: deleteError } = await supabase
              .from('lessons')
              .delete()
              .in('id', lessonIds as any[]);
            
            if (deleteError) throw deleteError;
          }
        }
        
        // Delete the module
        const { error } = await supabase
          .from('modules')
          .delete()
          .eq('id', moduleId as any);
        
        if (error) throw error;
        
        toast({
          title: "Module deleted",
          description: "The module and its lessons have been deleted successfully",
        });
        
        onRefresh();
      } catch (error: any) {
        toast({
          title: "Error deleting module",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };
  
  const handleMoveModule = async (moduleId: string, direction: 'up' | 'down') => {
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    const currentModule = modules[moduleIndex];
    
    const targetIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= modules.length) return;
    
    const targetModule = modules[targetIndex];
    
    try {
      // Swap sort orders
      const { error: error1 } = await supabase
        .from('modules')
        .update({ sort_order: targetModule.sort_order } as any)
        .eq('id', currentModule.id as any);
      
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from('modules')
        .update({ sort_order: currentModule.sort_order } as any)
        .eq('id', targetModule.id as any);
      
      if (error2) throw error2;
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error moving module",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleAddLesson = (moduleId?: string) => {
    if (moduleId) {
      // Adding a lesson to a module
      setSelectedLesson({
        title: '', 
        description: '',
        is_published: false,
        course_id: courseId,
        module_id: moduleId,
        sort_order: 0, 
        has_attachments: false
      });
    } else {
      // Adding a standalone lesson
      setSelectedLesson({
        title: '', 
        description: '',
        is_published: false,
        course_id: courseId,
        module_id: null,
        sort_order: 0, 
        has_attachments: false
      });
    }
    setIsLessonDialogOpen(true);
  };
  
  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsLessonDialogOpen(true);
  };
  
  const handleDeleteLesson = async (lessonId: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      try {
        const { error } = await supabase
          .from('lessons')
          .delete()
          .eq('id', lessonId as any);
        
        if (error) throw error;
        
        toast({
          title: "Lesson deleted",
          description: "The lesson has been deleted successfully",
        });
        
        onRefresh();
      } catch (error: any) {
        toast({
          title: "Error deleting lesson",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };
  
  const handleMoveLesson = async (lessonId: string, direction: 'up' | 'down', moduleId: string | null) => {
    const moduleLessons = lessons.filter(l => l.module_id === moduleId);
    const lessonIndex = moduleLessons.findIndex(l => l.id === lessonId);
    
    if (lessonIndex === -1) return;
    
    const currentLesson = moduleLessons[lessonIndex];
    
    const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= moduleLessons.length) return;
    
    const targetLesson = moduleLessons[targetIndex];
    
    try {
      // Swap sort orders
      const { error: error1 } = await supabase
        .from('lessons')
        .update({ sort_order: targetLesson.sort_order } as any)
        .eq('id', currentLesson.id as any);
      
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from('lessons')
        .update({ sort_order: currentLesson.sort_order } as any)
        .eq('id', targetLesson.id as any);
      
      if (error2) throw error2;
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error moving lesson",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleModule = (moduleId: string) => {
    setActiveModuleId(prevId => (prevId === moduleId ? null : moduleId));
  };
  
  const sortedModules = [...modules].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="space-y-4">
      {/* Add Module Button */}
      <div className="flex justify-end">
        <Button onClick={handleAddModule} className="mb-4">
          <Plus className="h-4 w-4 mr-2" />
          Add New Module
        </Button>
      </div>
      
      {/* Module List */}
      {sortedModules.length === 0 ? (
        <div className="text-center p-8 border rounded-md bg-muted/20">
          <h3 className="text-lg font-medium mb-2">No modules available</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding a module to organize your course content
          </p>
          <Button onClick={handleAddModule}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Module
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedModules.map((module, index) => (
            <ModuleItem
              key={module.id}
              module={module}
              isActive={activeModuleId === module.id}
              isFirst={index === 0}
              isLast={index === sortedModules.length - 1}
              lessons={lessons}
              onToggle={() => toggleModule(module.id)}
              onEdit={handleEditModule}
              onDelete={handleDeleteModule}
              onMove={handleMoveModule}
              onAddLesson={handleAddLesson}
              onEditLesson={handleEditLesson}
              onDeleteLesson={handleDeleteLesson}
              onMoveLesson={handleMoveLesson}
            />
          ))}
        </div>
      )}
      
      {/* Standalone Lessons Section */}
      <StandaloneLessons 
        isActive={isStandaloneLessonsActive}
        lessons={lessons}
        onToggle={() => setIsStandaloneLessonsActive(prev => !prev)}
        onAddLesson={() => handleAddLesson()}
        onEditLesson={handleEditLesson}
        onDeleteLesson={handleDeleteLesson}
        onMoveLesson={handleMoveLesson}
      />
      
      {/* Dialogs for Module and Lesson Forms */}
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
