
import React from 'react';

interface CourseDescriptionProps {
  description: string;
}

const CourseDescription = ({ description }: CourseDescriptionProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Course Description</h2>
      <div className="prose prose-invert max-w-none">
        <p>{description}</p>
      </div>
    </div>
  );
};

export default CourseDescription;
