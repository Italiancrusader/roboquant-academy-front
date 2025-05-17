
import React from 'react';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Course } from '@/types/courses';
import { supabase } from '@/integrations/supabase/client';

interface CourseFormData {
  title: string;
  description: string;
  price: number;
  level: string;
  is_published: boolean;
  cover_image: string;
}

interface CourseFormProps {
  editingCourse: Course | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const CourseForm = ({ editingCourse, onSuccess, onCancel }: CourseFormProps) => {
  const [formData, setFormData] = React.useState<CourseFormData>({
    title: editingCourse?.title || '',
    description: editingCourse?.description || '',
    price: editingCourse?.price || 0,
    level: editingCourse?.level || 'beginner',
    is_published: editingCourse?.is_published || false,
    cover_image: editingCourse?.cover_image || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price.toString()),
        level: formData.level,
        is_published: formData.is_published,
        cover_image: formData.cover_image || null,
      };
      
      if (editingCourse) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);
        
        if (error) throw error;
        
        toast({
          title: "Course updated",
          description: "The course has been updated successfully.",
        });
      } else {
        // Create new course
        const { data, error } = await supabase.from('courses').insert(courseData).select();
        
        if (error) throw error;
        
        toast({
          title: "Course created",
          description: "The course has been created successfully.",
        });
      }
      
      onSuccess();
      
    } catch (error: any) {
      toast({
        title: `Error ${editingCourse ? 'updating' : 'creating'} course`,
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Course Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="level">Level</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => handleSelectChange('level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Difficulty Level</SelectLabel>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="cover_image">Cover Image URL</Label>
          <Input
            id="cover_image"
            name="cover_image"
            value={formData.cover_image}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_published"
            name="is_published"
            checked={formData.is_published}
            onChange={handleCheckboxChange}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="is_published">Publish this course</Label>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{editingCourse ? 'Save Changes' : 'Create Course'}</Button>
      </div>
    </form>
  );
};

export default CourseForm;
