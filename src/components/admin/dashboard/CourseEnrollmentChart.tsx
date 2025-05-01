
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface CourseData {
  name: string;
  students: number;
  completion: number;
}

interface CourseEnrollmentChartProps {
  data: CourseData[];
  isLoading: boolean;
}

const CourseEnrollmentChart = ({ data, isLoading }: CourseEnrollmentChartProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Course Enrollment</CardTitle>
        <CardDescription>Students enrolled per course</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : data.length > 0 ? (
          <ChartContainer className="h-[300px]" config={{}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="students" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No course enrollment data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseEnrollmentChart;
