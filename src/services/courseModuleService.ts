
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Module, Lesson } from '@/types/courses';

export const deleteModule = async (moduleId: string): Promise<boolean> => {
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
    
    return true;
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
    return false;
  }
};

export const deleteLesson = async (lessonId: string): Promise<boolean> => {
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
    
    return true;
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
    return false;
  }
};

export const moveModule = async (modules: Module[], moduleId: string, direction: 'up' | 'down'): Promise<boolean> => {
  const moduleIndex = modules.findIndex(m => m.id === moduleId);
  if (moduleIndex === -1) return false;
  
  const targetIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;
  if (targetIndex < 0 || targetIndex >= modules.length) return false;
  
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
    
    return true;
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
    return false;
  }
};

export const moveLesson = async (lessons: Lesson[], lessonId: string, direction: 'up' | 'down', moduleId: string | null): Promise<boolean> => {
  const moduleLessons = lessons
    .filter(l => l.module_id === moduleId)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  
  const lessonIndex = moduleLessons.findIndex(l => l.id === lessonId);
  if (lessonIndex === -1) return false;
  
  const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
  if (targetIndex < 0 || targetIndex >= moduleLessons.length) return false;
  
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
    
    return true;
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
    return false;
  }
};
