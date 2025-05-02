
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Lesson } from '@/types/courses';

export const createLesson = async (lessonData: Partial<Lesson>, courseId: string): Promise<boolean> => {
  try {
    // Get max sort order for the module
    let maxSortOrder = 0;
    
    if (lessonData.module_id) {
      const { data: lessonsData, error: fetchError } = await supabase
        .from('lessons')
        .select('sort_order')
        .eq('module_id', lessonData.module_id)
        .order('sort_order', { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      maxSortOrder = lessonsData && lessonsData.length > 0 ? lessonsData[0].sort_order : 0;
    } else {
      const { data: lessonsData, error: fetchError } = await supabase
        .from('lessons')
        .select('sort_order')
        .is('module_id', null)
        .eq('course_id', courseId)
        .order('sort_order', { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      maxSortOrder = lessonsData && lessonsData.length > 0 ? lessonsData[0].sort_order : 0;
    }
    
    // Create new lesson
    const { error } = await supabase
      .from('lessons')
      .insert({
        ...lessonData,
        course_id: courseId,
        sort_order: maxSortOrder + 1
      });
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Lesson created successfully",
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

export const updateLesson = async (lessonId: string, lessonData: Partial<Lesson>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lessons')
      .update(lessonData)
      .eq('id', lessonId);
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Lesson updated successfully",
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

export const fetchModulesForCourse = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching modules:', error.message);
    toast({
      title: "Error",
      description: "Failed to fetch modules",
      variant: "destructive",
    });
    return [];
  }
};
