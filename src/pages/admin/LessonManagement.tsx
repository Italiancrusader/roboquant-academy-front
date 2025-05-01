
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Edit, Trash, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  sort_order: number;
  is_published: boolean | null;
  video_url: string | null;
  duration_minutes: number | null;
}

interface Course {
  id: string;
  title: string;
}

const LessonManagement = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    duration_minutes: 0,
    is_published: false,
  });

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchLessons();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error: any) {
      toast({
        title: "Error fetching course",
        description: error.message,
        variant: "destructive",
      });
      navigate('/admin/courses');
    }
  };

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching lessons",
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0,
    });
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get the highest sort order to place new lesson at the end
      const maxSortOrder = lessons.length > 0
        ? Math.max(...lessons.map(lesson => lesson.sort_order))
        : 0;

      const newLesson = {
        title: formData.title,
        description: formData.description || null,
        video_url: formData.video_url || null,
        duration_minutes: formData.duration_minutes || null,
        is_published: formData.is_published,
        course_id: courseId,
        sort_order: maxSortOrder + 1,
      };

      const { data, error } = await supabase.from('lessons').insert(newLesson).select();

      if (error) throw error;

      toast({
        title: "Lesson created",
        description: "The lesson has been created successfully.",
      });

      fetchLessons();
      setIsDialogOpen(false);
      resetForm();

    } catch (error: any) {
      toast({
        title: "Error creating lesson",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingLesson) return;

    try {
      const updatedLesson = {
        title: formData.title,
        description: formData.description || null,
        video_url: formData.video_url || null,
        duration_minutes: formData.duration_minutes || null,
        is_published: formData.is_published,
      };

      const { error } = await supabase
        .from('lessons')
        .update(updatedLesson)
        .eq('id', editingLesson.id);

      if (error) throw error;

      toast({
        title: "Lesson updated",
        description: "The lesson has been updated successfully.",
      });

      fetchLessons();
      setIsDialogOpen(false);
      resetForm();

    } catch (error: any) {
      toast({
        title: "Error updating lesson",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: "Lesson deleted",
        description: "The lesson has been deleted successfully.",
      });

      // Refetch to update sort order
      fetchLessons();

    } catch (error: any) {
      toast({
        title: "Error deleting lesson",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moveLesson = async (lessonId: string, direction: 'up' | 'down') => {
    const currentIndex = lessons.findIndex(lesson => lesson.id === lessonId);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === lessons.length - 1)
    ) {
      return; // Already at the top or bottom
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentLesson = lessons[currentIndex];
    const targetLesson = lessons[targetIndex];

    try {
      // Swap the sort_order of the two lessons
      const updates = [
        {
          id: currentLesson.id,
          sort_order: targetLesson.sort_order,
        },
        {
          id: targetLesson.id,
          sort_order: currentLesson.sort_order,
        },
      ];

      // Update both lessons in a transaction
      for (const update of updates) {
        const { error } = await supabase
          .from('lessons')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      fetchLessons();

    } catch (error: any) {
      toast({
        title: "Error reordering lessons",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const editLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      video_url: lesson.video_url || '',
      duration_minutes: lesson.duration_minutes || 0,
      is_published: lesson.is_published || false,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingLesson(null);
    setFormData({
      title: '',
      description: '',
      video_url: '',
      duration_minutes: 0,
      is_published: false,
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsDialogOpen(open);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin/courses')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
          <h1 className="text-3xl font-bold ml-4">Course Lessons</h1>
        </div>

        {course && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>Manage lessons for this course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-muted-foreground">
                    Total Lessons: <span className="font-medium text-foreground">{lessons.length}</span>
                  </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Lesson
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Create New Lesson'}</DialogTitle>
                      <DialogDescription>
                        {editingLesson 
                          ? 'Update the lesson details and click save to apply changes.' 
                          : 'Enter the lesson details to create a new lesson.'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={editingLesson ? handleUpdateLesson : handleCreateLesson}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="title">Lesson Title</Label>
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
                            rows={3}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="video_url">Video URL</Label>
                          <Input
                            id="video_url"
                            name="video_url"
                            value={formData.video_url}
                            onChange={handleInputChange}
                            placeholder="https://vimeo.com/123456789"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                          <Input
                            id="duration_minutes"
                            name="duration_minutes"
                            type="number"
                            min="0"
                            value={formData.duration_minutes}
                            onChange={handleNumberInputChange}
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
                          <Label htmlFor="is_published">Publish this lesson</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">{editingLesson ? 'Save Changes' : 'Create Lesson'}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No lessons available</h3>
            <p className="text-muted-foreground mb-6">Create your first lesson to get started</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Lesson
            </Button>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell>
                      <div className="flex flex-col items-center space-y-1">
                        <span className="font-medium">{lesson.sort_order}</span>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5"
                            onClick={() => moveLesson(lesson.id, 'up')}
                            disabled={lesson.sort_order === 1}
                          >
                            <ArrowUpCircle className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5"
                            onClick={() => moveLesson(lesson.id, 'down')}
                            disabled={lesson.sort_order === lessons.length}
                          >
                            <ArrowDownCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell>
                      {lesson.duration_minutes 
                        ? `${Math.floor(lesson.duration_minutes / 60)}h ${lesson.duration_minutes % 60}m` 
                        : 'Not set'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={lesson.is_published ? 'default' : 'secondary'}>
                        {lesson.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lesson.video_url ? (
                        <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-800">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-800">
                          Missing
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => editLesson(lesson)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteLesson(lesson.id)}>
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

export default LessonManagement;
