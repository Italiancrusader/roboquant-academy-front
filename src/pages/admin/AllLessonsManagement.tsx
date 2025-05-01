
import React, { useEffect, useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit, BookOpen } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  course_id: string;
  sort_order: number;
  is_published: boolean | null;
  video_url: string | null;
  duration_minutes: number | null;
  course_title: string; // Added to display the course title
}

const AllLessonsManagement = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      
      // Join lessons with courses to get course titles
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          courses:course_id (
            title
          )
        `)
        .order('course_id', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Format the data to include the course title
      const formattedLessons = data.map(lesson => ({
        ...lesson,
        course_title: lesson.courses?.title || 'Unknown Course'
      }));
      
      setLessons(formattedLessons);
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

  const handleEditLesson = (courseId: string, lesson: Lesson) => {
    navigate(`/admin/courses/${courseId}/lessons`, { state: { editLessonId: lesson.id } });
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/admin/courses/${courseId}/lessons`);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">All Lessons</h1>
          <p className="text-muted-foreground">
            Manage lessons across all courses
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Lessons Overview</CardTitle>
            <CardDescription>
              View and manage all lessons in your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground">
                  Total Lessons: <span className="font-medium text-foreground">{lessons.length}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No lessons available</h3>
            <p className="text-muted-foreground mb-6">There are no lessons created yet</p>
            <Button onClick={() => navigate('/admin/courses')}>
              Go to Courses
            </Button>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Order</TableHead>
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
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-normal"
                        onClick={() => handleViewCourse(lesson.course_id)}
                      >
                        {lesson.course_title}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell>{lesson.sort_order}</TableCell>
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditLesson(lesson.course_id, lesson)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewCourse(lesson.course_id)}
                        >
                          <BookOpen className="h-4 w-4" />
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

export default AllLessonsManagement;
