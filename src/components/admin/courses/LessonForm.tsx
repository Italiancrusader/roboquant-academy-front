
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Lesson } from '@/types/courses';
import { validateLessonData } from './utils/lessonFormUtils';
import ModuleSelector from './lesson-form/ModuleSelector';
import VideoUrlInput from './lesson-form/VideoUrlInput';
import { createLesson, updateLesson, fetchModulesForCourse } from '@/services/lessonService';

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
  const [hasAttachments, setHasAttachments] = useState(lesson?.has_attachments || false);
  const [modules, setModules] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const loadModules = async () => {
      const modulesData = await fetchModulesForCourse(courseId);
      setModules(modulesData);
    };
    
    loadModules();
  }, [courseId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLessonData(title)) {
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
        course_id: courseId,
        has_attachments: hasAttachments
      };
      
      let success;
      
      if (lesson?.id) {
        // Update existing lesson
        success = await updateLesson(lesson.id, lessonData);
      } else {
        // Create new lesson
        success = await createLesson(lessonData, courseId);
      }
      
      if (success) {
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
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
      
      <ModuleSelector 
        moduleId={moduleId}
        modules={modules}
        onChange={setModuleId}
      />
      
      <VideoUrlInput
        videoUrl={videoUrl}
        onVideoUrlChange={setVideoUrl}
        onDurationExtracted={setDurationMinutes}
      />
      
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
          id="has-attachments"
          checked={hasAttachments}
          onCheckedChange={setHasAttachments}
        />
        <Label htmlFor="has-attachments">Has attachments</Label>
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
