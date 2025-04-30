
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Clock, ChevronRight } from 'lucide-react';

interface CourseHeaderProps {
  title: string;
  level: string | null;
  duration_minutes: number | null;
}

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

const CourseHeader = ({ title, level, duration_minutes }: CourseHeaderProps) => {
  return (
    <div className="mb-6">
      <Link to="/courses" className="text-muted-foreground hover:text-foreground flex items-center mb-4">
        <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
        Back to Courses
      </Link>
      <h1 className="text-3xl font-bold gradient-text mb-2">{title}</h1>
      <div className="flex items-center gap-2 mb-4">
        {level && getLevelBadge(level)}
        {duration_minutes && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            {Math.floor(duration_minutes / 60)} hrs {duration_minutes % 60} mins
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseHeader;
