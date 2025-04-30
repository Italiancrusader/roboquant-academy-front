
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  price: number;
  duration_minutes: number | null;
  level: string | null;
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('is_published', true);

        if (error) throw error;
        setCourses(data || []);
      } catch (error: any) {
        toast({
          title: "Error loading courses",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getLevelBadge = (level: string | null) => {
    switch (level) {
      case 'beginner':
        return <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800">Beginner</Badge>;
      case 'intermediate':
        return <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-800">Intermediate</Badge>;
      case 'advanced':
        return <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-800">Advanced</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <h1 className="text-3xl font-bold gradient-text mb-2">Available Courses</h1>
        <p className="text-muted-foreground mb-8">Explore our collection of courses to enhance your skills</p>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium mb-2">No courses available</h3>
            <p className="text-muted-foreground">Check back later for new courses</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link to={`/courses/${course.id}`} key={course.id}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    {course.cover_image ? (
                      <img 
                        src={course.cover_image} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-accent flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      {course.level && getLevelBadge(course.level)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">{course.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div>
                      {course.duration_minutes && (
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(course.duration_minutes / 60)} hrs {course.duration_minutes % 60} mins
                        </span>
                      )}
                    </div>
                    <div className="font-semibold">${course.price.toFixed(2)}</div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
