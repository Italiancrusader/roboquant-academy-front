
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Play } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
}

interface CourseContentListProps {
  lessons: Lesson[];
  totalDuration: number | null;
}

const CourseContentList = ({ lessons, totalDuration }: CourseContentListProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Course Content</h2>
      {lessons.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">No lessons available yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{lessons.length} Lessons</CardTitle>
              {totalDuration && (
                <div className="text-sm text-muted-foreground flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {Math.floor(totalDuration / 60)} hrs {totalDuration % 60} mins
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="bg-primary/20 rounded-full p-1">
                        <Play className="h-3 w-3 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      {lesson.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{lesson.description}</p>
                      )}
                    </div>
                  </div>
                  {lesson.duration_minutes && (
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {lesson.duration_minutes} min
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseContentList;
