
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface DashboardData {
  totalCourses: number;
  totalLessons: number;
  totalUsers: number;
  totalRevenue: number;
  recentSignups: { id: string; email: string; created_at: string }[];
}

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalCourses: 0,
    totalLessons: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentSignups: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch total courses
        const { data: courses, error: coursesError, count: coursesCount } = await supabase
          .from('courses')
          .select('*', { count: 'exact' });

        if (coursesError) throw new Error(`Error fetching courses: ${coursesError.message}`);

        // Fetch total lessons
        const { data: lessons, error: lessonsError, count: lessonsCount } = await supabase
          .from('lessons')
          .select('*', { count: 'exact' });

        if (lessonsError) throw new Error(`Error fetching lessons: ${lessonsError.message}`);

        // Fetch total users
        const { data: users, error: usersError, count: usersCount } = await supabase
          .from('auth_users_view')
          .select('*', { count: 'exact' });

        if (usersError) throw new Error(`Error fetching users: ${usersError.message}`);

        // Fetch total revenue (example: sum of course prices - adjust as needed)
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('course_id');

        if (enrollmentsError) throw new Error(`Error fetching enrollments: ${enrollmentsError.message}`);

        let totalRevenue = 0;

        if (enrollments && enrollments.length > 0) {
          // Fetch course prices for enrolled courses
          const courseIds = enrollments
            .filter((enrollment): enrollment is { course_id: string } => 
              enrollment && typeof enrollment === 'object' && 'course_id' in enrollment)
            .map(enrollment => enrollment.course_id);

          if (courseIds.length > 0) {
            const { data: coursePrices, error: coursePricesError } = await supabase
              .from('courses')
              .select('price')
              .in('id', courseIds as any);

            if (coursePricesError) {
              console.error("Error fetching course prices:", coursePricesError);
            } else if (coursePrices) {
              totalRevenue = coursePrices
                .filter((course): course is { price: number } => 
                  course && typeof course === 'object' && 'price' in course)
                .reduce((sum, course) => sum + (course.price || 0), 0);
            }
          }
        }

        // Fetch recent signups (example: last 5 users)
        const { data: recentSignups, error: recentSignupsError } = await supabase
          .from('auth_users_view')
          .select('id, email, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentSignupsError) throw new Error(`Error fetching recent signups: ${recentSignupsError.message}`);

        // Format the recent signup data with type safety
        const formattedSignups = (recentSignups || []).map(user => {
          if (!user || typeof user !== 'object') {
            return {
              id: 'unknown',
              email: 'unknown',
              created_at: new Date().toISOString()
            };
          }
          
          return {
            id: (user as any).id as string || 'unknown',
            email: (user as any).email as string || 'unknown',
            created_at: (user as any).created_at as string || new Date().toISOString()
          };
        });

        setDashboardData({
          totalCourses: coursesCount || 0,
          totalLessons: lessonsCount || 0,
          totalUsers: usersCount || 0,
          totalRevenue: totalRevenue,
          recentSignups: formattedSignups,
        });
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error fetching dashboard data",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { dashboardData, isLoading, error };
};
