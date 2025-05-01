
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  cover_image: string | null; // Updated to match database column name
  progress: number;
  lessons_count: number;
}

interface CourseGridProps {
  courses: Course[];
  className?: string;
}

const CourseGrid: React.FC<CourseGridProps> = ({ courses, className }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {courses.map((course) => (
        <Link to={`/courses/${course.id}`} key={course.id}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-muted relative">
              {course.cover_image ? (
                <img 
                  src={course.cover_image} 
                  alt={course.title} 
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-secondary">
                  <p className="text-lg font-medium">{course.title}</p>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2 line-clamp-1">{course.title}</h3>
              
              <div className="mt-2 mb-1">
                <Progress 
                  value={course.progress} 
                  className={cn(
                    "h-2",
                    course.progress === 100 ? "bg-green-500" : ""
                  )} 
                />
              </div>
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{course.progress}% complete</span>
                <span>{course.lessons_count} lessons</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default CourseGrid;
