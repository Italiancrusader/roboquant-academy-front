
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface EngagementData {
  name: string;
  value: number;
}

interface WeeklyEngagementChartProps {
  data: EngagementData[];
  isLoading: boolean;
}

const WeeklyEngagementChart = ({ data, isLoading }: WeeklyEngagementChartProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Weekly Engagement</CardTitle>
        <CardDescription>Platform activity over the past week</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : data.length > 0 ? (
          <ChartContainer className="h-[300px]" config={{}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No engagement data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyEngagementChart;
