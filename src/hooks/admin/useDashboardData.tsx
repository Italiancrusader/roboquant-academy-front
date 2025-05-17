
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  totalCourses: number;
  totalStudents: number;
  avgCompletionRate: number;
  coursesData: CourseData[];
  engagementData: EngagementData[];
  isLoading: boolean;
}

export interface CourseData {
  name: string;
  students: number;
  completion: number;
}

export interface EngagementData {
  name: string;
  value: number;
}

export const useDashboardData = (): DashboardData => {
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [avgCompletionRate, setAvgCompletionRate] = useState(0);
  const [coursesData, setCoursesData] = useState<CourseData[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch total number of courses
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('id, title');
          
        if (coursesError) throw coursesError;
        setTotalCourses(courses?.length || 0);
        
        // Fetch unique enrolled students
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('user_id')
          .order('user_id');
          
        if (enrollmentsError) throw enrollmentsError;
        
        // Get unique student count
        const uniqueStudents = new Set(enrollments?.map(e => e.user_id));
        setTotalStudents(uniqueStudents.size);
        
        // Get course enrollment and completion data
        const courseDataPromises = courses?.map(async (course) => {
          // Get enrollments for this course
          const { data: courseEnrollments, error: enrollError } = await supabase
            .from('enrollments')
            .select('user_id')
            .eq('course_id', course.id);
            
          if (enrollError) throw enrollError;
          
          // Get all lessons for this course
          const { data: lessons, error: lessonsError } = await supabase
            .from('lessons')
            .select('id')
            .eq('course_id', course.id)
            .eq('is_published', true);
            
          if (lessonsError) throw lessonsError;
          
          // Get completion data for this course
          const { data: completions, error: completionsError } = await supabase
            .from('progress')
            .select('user_id, completed')
            .eq('course_id', course.id)
            .eq('completed', true);
            
          if (completionsError) throw completionsError;
          
          // Calculate completion percentage
          const totalLessons = lessons?.length || 1; // Avoid division by zero
          const totalEnrollments = courseEnrollments?.length || 0;
          const totalCompletions = completions?.length || 0;
          
          // Assuming each user completes each lesson once
          const completionPercentage = totalEnrollments > 0 && totalLessons > 0 
            ? Math.round((totalCompletions / (totalEnrollments * totalLessons)) * 100) 
            : 0;
          
          return {
            name: course.title,
            students: courseEnrollments?.length || 0,
            completion: completionPercentage
          };
        }) || [];
        
        // Wait for all promises to resolve
        const resolvedCourseData = await Promise.all(courseDataPromises);
        setCoursesData(resolvedCourseData);
        
        // Calculate average completion rate
        const totalCompletionRate = resolvedCourseData.reduce((sum, course) => sum + course.completion, 0);
        setAvgCompletionRate(
          resolvedCourseData.length > 0 ? 
          parseFloat((totalCompletionRate / resolvedCourseData.length).toFixed(1)) : 
          0
        );
        
        // Generate engagement data for the past week
        const weekEngagement = await fetchWeeklyEngagementData();
        setEngagementData(weekEngagement);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const fetchWeeklyEngagementData = async () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: EngagementData[] = [];
    
    // Get current date and time
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    for (let i = 6; i >= 0; i--) {
      // Calculate the date for each day of the past week
      const dayOffset = (currentDay - i + 7) % 7;  // Ensure we wrap around properly
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - i);
      
      // Format date for database query
      const startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
      
      // Query the progress table for last_accessed_at within this day
      const { data, error } = await supabase
        .from('progress')
        .select('id')
        .gte('last_accessed_at', startDate.toISOString())
        .lte('last_accessed_at', endDate.toISOString());
        
      if (error) {
        console.error('Error fetching engagement data:', error);
        result.push({ name: days[dayOffset], value: 0 });
      } else {
        result.push({ name: days[dayOffset], value: data?.length || 0 });
      }
    }
    
    return result;
  };

  return {
    totalCourses,
    totalStudents,
    avgCompletionRate,
    coursesData,
    engagementData,
    isLoading
  };
};
