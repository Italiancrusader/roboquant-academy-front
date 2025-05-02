
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ModuleList from '@/components/admin/courses/ModuleList';
import { Course, Module, Lesson } from '@/types/courses';

const CourseConfigPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourseData = async () => {
    if (!courseId) return;
    
    setIsLoading(true);
    
    try {
      // Fetch course details - now selecting all required Course fields
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*') // Select all fields to match the Course interface
        .eq('id', courseId)
        .single();
      
      if (courseError) throw courseError;
      setCourse(courseData);
      
      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });
      
      if (modulesError) throw modulesError;
      setModules(modulesData || []);
      
      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });
      
      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);
      
    } catch (error: any) {
      toast({
        title: "Error loading course data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/admin/courses')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <h1 className="text-2xl font-bold">
              {course ? `Configure: ${course.title}` : 'Course Configuration'}
            </h1>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Title</h3>
                    <p>{course?.title}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Level</h3>
                    <p>{course?.level || 'Not specified'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="font-medium">Description</h3>
                    <p className="text-sm text-muted-foreground">{course?.description}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/admin/courses`)}
                    >
                      Edit Course Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Content Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <ModuleList 
                  courseId={courseId || ''}
                  modules={modules}
                  lessons={lessons}
                  onRefresh={fetchCourseData}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default CourseConfigPage;
