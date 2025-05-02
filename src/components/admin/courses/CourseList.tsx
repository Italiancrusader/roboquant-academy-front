
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash, Settings, BarChart } from 'lucide-react';
import { Course } from '@/types/courses';

interface CourseListProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
}

const CourseList = ({ courses, onEdit, onDelete }: CourseListProps) => {
  const navigate = useNavigate();

  const handleConfigureCourse = (courseId: string) => {
    navigate(`/admin/courses/${courseId}/configure`);
  };

  return (
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
                  <Button variant="ghost" size="icon" onClick={() => handleConfigureCourse(course.id)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(course)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(course.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/courses/${course.id}/analytics`}>
                      <BarChart className="h-4 w-4 mr-2" />
                      Analytics
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CourseList;
