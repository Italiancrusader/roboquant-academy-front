
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import CourseList from '@/components/admin/courses/CourseList';
import CourseForm from '@/components/admin/courses/CourseForm';
import EmptyState from '@/components/admin/courses/EmptyState';
import { Course } from '@/types/courses';

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setCourses(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching courses",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
      
      if (error) throw error;
      
      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully.",
      });
      
      fetchCourses();
      
    } catch (error: any) {
      toast({
        title: "Error deleting course",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const editCourse = (course: Course) => {
    setEditingCourse(course);
    setIsDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setEditingCourse(null);
    }
    setIsDialogOpen(open);
  };

  const handleFormSuccess = () => {
    fetchCourses();
    setIsDialogOpen(false);
    setEditingCourse(null);
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Course Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <Button onClick={handleAddCourse}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Course
            </Button>
            
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
                <DialogDescription>
                  {editingCourse 
                    ? 'Update the course details and click save to apply changes.' 
                    : 'Enter the course details to create a new course.'}
                </DialogDescription>
              </DialogHeader>
              
              <CourseForm 
                editingCourse={editingCourse}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : courses.length === 0 ? (
          <EmptyState onAddCourse={handleAddCourse} />
        ) : (
          <CourseList 
            courses={courses}
            onEdit={editCourse}
            onDelete={handleDeleteCourse}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default CourseManagement;
