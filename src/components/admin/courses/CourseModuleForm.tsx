
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Module {
  id?: string;
  title: string;
  course_id: string;
  sort_order?: number;
}

interface CourseModuleFormProps {
  courseId: string;
  module?: Module;
  onSuccess: () => void;
  onCancel: () => void;
}

const CourseModuleForm = ({ courseId, module, onSuccess, onCancel }: CourseModuleFormProps) => {
  const [title, setTitle] = React.useState(module?.title || '');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Module title is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (module?.id) {
        // Update existing module
        const { error } = await supabase
          .from('modules')
          .update({ title })
          .eq('id', module.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Module updated successfully",
        });
      } else {
        // Get max sort order
        const { data: modulesData, error: fetchError } = await supabase
          .from('modules')
          .select('sort_order')
          .eq('course_id', courseId)
          .order('sort_order', { ascending: false })
          .limit(1);
        
        if (fetchError) throw fetchError;
        
        const maxSortOrder = modulesData && modulesData.length > 0 ? modulesData[0].sort_order : 0;
        
        // Create new module
        const { error } = await supabase
          .from('modules')
          .insert({
            title,
            course_id: courseId,
            sort_order: maxSortOrder + 1
          });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Module created successfully",
        });
      }
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Module Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter module title"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : module?.id ? 'Update Module' : 'Create Module'}
        </Button>
      </div>
    </form>
  );
};

export default CourseModuleForm;
