
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  level: string | null;
  is_published: boolean | null;
  cover_image: string | null;
  duration_minutes: number | null;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    level: 'beginner',
    is_published: false,
    cover_image: '',
  });
  
  const navigate = useNavigate();

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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newCourse = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price.toString()),
        level: formData.level,
        is_published: formData.is_published,
        cover_image: formData.cover_image || null,
      };
      
      const { data, error } = await supabase.from('courses').insert(newCourse).select();
      
      if (error) throw error;
      
      toast({
        title: "Course created",
        description: "The course has been created successfully.",
      });
      
      fetchCourses();
      setIsDialogOpen(false);
      resetForm();
      
    } catch (error: any) {
      toast({
        title: "Error creating course",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCourse) return;
    
    try {
      const updatedCourse = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price.toString()),
        level: formData.level,
        is_published: formData.is_published,
        cover_image: formData.cover_image || null,
      };
      
      const { error } = await supabase
        .from('courses')
        .update(updatedCourse)
        .eq('id', editingCourse.id);
      
      if (error) throw error;
      
      toast({
        title: "Course updated",
        description: "The course has been updated successfully.",
      });
      
      fetchCourses();
      setIsDialogOpen(false);
      resetForm();
      
    } catch (error: any) {
      toast({
        title: "Error updating course",
        description: error.message,
        variant: "destructive",
      });
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
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price,
      level: course.level || 'beginner',
      is_published: course.is_published || false,
      cover_image: course.cover_image || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      price: 0,
      level: 'beginner',
      is_published: false,
      cover_image: '',
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsDialogOpen(open);
  };

  const manageCourseLessons = (courseId: string) => {
    navigate(`/admin/courses/${courseId}/lessons`);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Course Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
                <DialogDescription>
                  {editingCourse 
                    ? 'Update the course details and click save to apply changes.' 
                    : 'Enter the course details to create a new course.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}>
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
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingCourse ? 'Save Changes' : 'Create Course'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No courses available</h3>
            <p className="text-muted-foreground mb-6">Create your first course to get started</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Course
            </Button>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[350px]">Title</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      {course.level && (
                        <Badge variant="outline" className={
                          course.level === 'beginner' ? 'bg-green-900/20 text-green-400 border-green-800' :
                          course.level === 'intermediate' ? 'bg-blue-900/20 text-blue-400 border-blue-800' :
                          'bg-red-900/20 text-red-400 border-red-800'
                        }>
                          {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>${course.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={course.is_published ? 'default' : 'secondary'}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => manageCourseLessons(course.id)}>
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => editCourse(course)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCourse(course.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CourseManagement;
