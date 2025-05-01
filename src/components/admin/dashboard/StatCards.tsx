
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  description: string;
  value: React.ReactNode;
  isLoading: boolean;
}

const StatCard = ({ title, description, value, isLoading }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-16 animate-pulse bg-muted rounded-md"></div>
        ) : (
          <p className="text-3xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface StatCardsProps {
  totalCourses: number;
  totalStudents: number;
  avgCompletionRate: number;
  isLoading: boolean;
}

const StatCards = ({ totalCourses, totalStudents, avgCompletionRate, isLoading }: StatCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="Total Courses"
        description="Active courses in the platform"
        value={totalCourses}
        isLoading={isLoading}
      />
      
      <StatCard
        title="Total Students"
        description="Registered students"
        value={totalStudents}
        isLoading={isLoading}
      />
      
      <StatCard
        title="Completion Rate"
        description="Average course completion"
        value={`${avgCompletionRate}%`}
        isLoading={isLoading}
      />
    </div>
  );
};

export default StatCards;
