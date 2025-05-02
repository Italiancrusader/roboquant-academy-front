import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Module, Lesson } from '@/types/courses';

interface LessonFormProps {
  courseId: string;
  lesson?: Lesson;
  onSuccess: () => void;
  onCancel: () => void;
}

const LessonForm = ({ courseId, lesson, onSuccess, onCancel }: LessonFormProps) => {
  const [title, setTitle] = useState(lesson?.title || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url || '');
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>(lesson?.duration_minutes);
  const [isPublished, setIsPublished] = useState(lesson?.is_published || false);
  const [moduleId, setModuleId] = useState<string | undefined>(lesson?.module_id);
  const [modules, setModules] = useState<Module[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch modules for the course
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('id, title')
          .eq('course_id', courseId)
          .order('sort_order', { ascending: true });
        
        if (error) throw error;
        setModules(data || []);
      } catch (error: any) {
        console.error('Error fetching modules:', error.message);
        toast({
          title: "Error",
          description: "Failed to fetch modules",
          variant: "destructive",
        });
      }
    };
    
    fetchModules();
  }, [courseId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Lesson title is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const lessonData = {
        title,
        description: description || null,
        video_url: videoUrl || null,
        duration_minutes: durationMinutes || null,
        is_published: isPublished,
        module_id: moduleId || null,
        course_id: courseId
      };
      
      if (lesson?.id) {
        // Update existing lesson
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', lesson.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Lesson updated successfully",
        });
      } else {
        // Get max sort order for the module
        let maxSortOrder = 0;
        
        if (moduleId) {
          const { data: lessonsData, error: fetchError } = await supabase
            .from('lessons')
            .select('sort_order')
            .eq('module_id', moduleId)
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
            sort_order: maxSortOrder + 1
          });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Lesson created successfully",
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

  const extractVimeoDuration = async () => {
    if (!videoUrl || !videoUrl.includes('vimeo.com')) {
      return;
    }
    
    // Extract Vimeo ID from URL
    const vimeoIdMatch = videoUrl.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    if (!vimeoIdMatch || !vimeoIdMatch[1]) {
      return;
    }
    
    const vimeoId = vimeoIdMatch[1];
    
    try {
      // Fetch video metadata from Vimeo oEmbed API
      const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`);
      const data = await response.json();
      
      if (data.duration) {
        setDurationMinutes(data.duration / 60);
        toast({
          title: "Video duration fetched",
          description: `Duration set to ${Math.floor(data.duration / 60)}m ${data.duration % 60}s`,
        });
      }
    } catch (error) {
      console.error('Error fetching Vimeo duration:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Lesson Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter lesson title"
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter lesson description"
          rows={3}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="module">Module</Label>
        <select
          id="module"
          value={moduleId || ''}
          onChange={(e) => setModuleId(e.target.value || undefined)}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
        >
          <option value="">No Module (Standalone Lesson)</option>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="videoUrl">Video URL (Vimeo)</Label>
        <div className="flex gap-2">
          <Input
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://vimeo.com/123456789"
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={extractVimeoDuration}
            disabled={!videoUrl || !videoUrl.includes('vimeo.com')}
          >
            Get Duration
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter a Vimeo URL and click "Get Duration" to automatically fetch the video duration
        </p>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          min="0"
          step="0.1"
          value={durationMinutes === undefined ? '' : durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="Enter duration in minutes"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="is-published"
          checked={isPublished}
          onCheckedChange={setIsPublished}
        />
        <Label htmlFor="is-published">Publish this lesson</Label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : lesson?.id ? 'Update Lesson' : 'Create Lesson'}
        </Button>
      </div>
    </form>
  );
};

export default LessonForm;
