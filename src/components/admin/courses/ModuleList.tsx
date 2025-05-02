
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { ArrowUp, ArrowDown, Edit, Trash, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CourseModuleForm from './CourseModuleForm';
import LessonForm from './LessonForm';

interface Module {
  id: string;
  title: string;
  sort_order: number;
  course_id: string;
}

interface Lesson {
  id?: string;
  title: string;
  description?: string | null;
  video_url?: string | null;
  duration_minutes?: number | null;
  is_published?: boolean | null;
  module_id?: string | null;
  sort_order?: number;
  course_id: string;
}

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
    setSelectedLesson(undefined);
    setIsLessonDialogOpen(true);
    // Pre-select the module in the form - added necessary fields for Lesson type
    setSelectedLesson({ 
      course_id: courseId, 
      module_id: moduleId,
      title: ''  // Adding required title field
    } as Lesson);
  };
  
  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsLessonDialogOpen(true);
  };
  
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) {
      return;
    }
    
    try {
      // First delete all lessons in this module
      const { error: lessonError } = await supabase
        .from('lessons')
        .delete()
        .eq('module_id', moduleId);
      
      if (lessonError) throw lessonError;
      
      // Then delete the module
      const { error: moduleError } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);
      
      if (moduleError) throw moduleError;
      
      toast({
        title: "Success",
        description: "Module and its lessons deleted successfully",
      });
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Lesson deleted successfully",
      });
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const moveModule = async (moduleId: string, direction: 'up' | 'down') => {
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return;
    
    const targetIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;
    if (targetIndex < 0 || targetIndex >= modules.length) return;
    
    try {
      const currentModule = modules[moduleIndex];
      const targetModule = modules[targetIndex];
      
      // Swap sort orders
      const { error: error1 } = await supabase
        .from('modules')
        .update({ sort_order: targetModule.sort_order })
        .eq('id', currentModule.id);
      
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from('modules')
        .update({ sort_order: currentModule.sort_order })
        .eq('id', targetModule.id);
      
      if (error2) throw error2;
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const moveLesson = async (lessonId: string, direction: 'up' | 'down', moduleId: string | null) => {
    const moduleLessons = lessons.filter(l => l.module_id === moduleId)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    
    const lessonIndex = moduleLessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return;
    
    const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    if (targetIndex < 0 || targetIndex >= moduleLessons.length) return;
    
    try {
      const currentLesson = moduleLessons[lessonIndex];
      const targetLesson = moduleLessons[targetIndex];
      
      // Swap sort orders
      const { error: error1 } = await supabase
        .from('lessons')
        .update({ sort_order: targetLesson.sort_order })
        .eq('id', currentLesson.id || '');
      
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from('lessons')
        .update({ sort_order: currentLesson.sort_order })
        .eq('id', targetLesson.id || '');
      
      if (error2) throw error2;
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  // Filter lessons by module
  const getModuleLessons = (moduleId: string) => {
    return lessons
      .filter(lesson => lesson.module_id === moduleId)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  };
  
  // Get standalone lessons (no module)
  const standaloneLessons = lessons
    .filter(lesson => lesson.module_id === null)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Course Structure</h3>
        <Button onClick={() => { setSelectedModule(undefined); setIsModuleDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>
      
      <div className="space-y-2">
        {modules.map((module) => (
          <div key={module.id} className="border rounded-md">
            <div className="flex justify-between items-center p-3 bg-muted/30">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleModule(module.id)}>
                <span className="font-medium">{module.title}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => moveModule(module.id, 'up')}
                  disabled={module === modules[0]}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => moveModule(module.id, 'down')}
                  disabled={module === modules[modules.length - 1]}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEditModule(module)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteModule(module.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {activeModuleId === module.id && (
              <div className="p-3 border-t">
                <div className="space-y-2">
                  {getModuleLessons(module.id).map((lesson) => (
                    <div key={lesson.id} className="flex justify-between items-center p-2 border rounded-sm bg-background">
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
                          onClick={() => moveLesson(lesson.id || '', 'up', module.id)}
                          disabled={lesson === getModuleLessons(module.id)[0]}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => moveLesson(lesson.id || '', 'down', module.id)}
                          disabled={lesson === getModuleLessons(module.id)[getModuleLessons(module.id).length - 1]}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditLesson(lesson)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteLesson(lesson.id || '')}
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
                    onClick={() => handleAddLessonToModule(module.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        
        <div className="border rounded-md">
          <div className="flex justify-between items-center p-3 bg-muted/30">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleModule('standalone')}>
              <span className="font-medium">Standalone Lessons</span>
            </div>
          </div>
          
          {activeModuleId === 'standalone' && (
            <div className="p-3 border-t">
              <div className="space-y-2">
                {standaloneLessons.map((lesson) => (
                  <div key={lesson.id} className="flex justify-between items-center p-2 border rounded-sm bg-background">
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
                        onClick={() => moveLesson(lesson.id || '', 'up', null)}
                        disabled={lesson === standaloneLessons[0]}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => moveLesson(lesson.id || '', 'down', null)}
                        disabled={lesson === standaloneLessons[standaloneLessons.length - 1]}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditLesson(lesson)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteLesson(lesson.id || '')}
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
                  onClick={() => { 
                    setSelectedLesson({ 
                      course_id: courseId, 
                      module_id: null,
                      title: '' // Adding required title field
                    } as Lesson); 
                    setIsLessonDialogOpen(true); 
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Standalone Lesson
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Module Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedModule ? 'Edit Module' : 'Add New Module'}</DialogTitle>
          </DialogHeader>
          <CourseModuleForm 
            courseId={courseId} 
            module={selectedModule} 
            onSuccess={() => { onRefresh(); setIsModuleDialogOpen(false); }}
            onCancel={() => setIsModuleDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedLesson?.id ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
          </DialogHeader>
          <LessonForm 
            courseId={courseId} 
            lesson={selectedLesson} 
            onSuccess={() => { onRefresh(); setIsLessonDialogOpen(false); }}
            onCancel={() => setIsLessonDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModuleList;
