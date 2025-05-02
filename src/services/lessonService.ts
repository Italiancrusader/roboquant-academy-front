
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Lesson } from '@/types/courses';

export const createLesson = async (lessonData: Partial<Lesson>, courseId: string): Promise<boolean> => {
  try {
    // Check if title is provided since it's required by the database
    if (!lessonData.title) {
      toast({
        title: "Error",
        description: "Lesson title is required",
        variant: "destructive",
      });
      return false;
    }
    
    // Get max sort order for the module or standalone lessons
    let maxSortOrder = 0;
    
    if (lessonData.module_id) {
      const { data: lessonsData, error: fetchError } = await supabase
        .from('lessons')
        .select('sort_order')
        .eq('module_id', lessonData.module_id)
        .eq('course_id', courseId)
        .order('sort_order', { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      maxSortOrder = lessonsData && lessonsData.length > 0 ? (lessonsData[0].sort_order || 0) : 0;
    } else {
      const { data: lessonsData, error: fetchError } = await supabase
        .from('lessons')
        .select('sort_order')
        .is('module_id', null)
        .eq('course_id', courseId)
        .order('sort_order', { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      maxSortOrder = lessonsData && lessonsData.length > 0 ? (lessonsData[0].sort_order || 0) : 0;
    }
    
    // Create new lesson with all required fields
    const newLesson = {
      title: lessonData.title,
      description: lessonData.description || null,
      video_url: lessonData.video_url || null,
      duration_minutes: lessonData.duration_minutes || null,
      is_published: lessonData.is_published || false,
      module_id: lessonData.module_id || null,
      course_id: courseId,
      sort_order: maxSortOrder + 1,
      has_attachments: false // Adding this to ensure the required field is provided
    };
    
    // Create new lesson
    const { error } = await supabase
      .from('lessons')
      .insert(newLesson);
    
    if (error) {
      console.error("Error creating lesson:", error);
      throw error;
    }
    
    toast({
      title: "Success",
      description: "Lesson created successfully",
    });
    
    return true;
  } catch (error: any) {
    console.error("Error in createLesson:", error);
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
    // We must ensure that title is present for update operations if it's being modified
    if (lessonData.hasOwnProperty('title') && !lessonData.title) {
      toast({
        title: "Error",
        description: "Lesson title cannot be empty",
        variant: "destructive",
      });
      return false;
    }
    
    const { error } = await supabase
      .from('lessons')
      .update(lessonData)
      .eq('id', lessonId);
    
    if (error) {
      console.error("Error updating lesson:", error);
      throw error;
    }
    
    toast({
      title: "Success",
      description: "Lesson updated successfully",
    });
    
    return true;
  } catch (error: any) {
    console.error("Error in updateLesson:", error);
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
