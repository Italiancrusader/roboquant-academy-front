
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddCourse: () => void;
}

const EmptyState = ({ onAddCourse }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-medium mb-2">No courses available</h3>
      <p className="text-muted-foreground mb-6">Create your first course to get started</p>
      <Button onClick={onAddCourse}>
        <Plus className="mr-2 h-4 w-4" />
        Add New Course
      </Button>
    </div>
  );
};

export default EmptyState;
