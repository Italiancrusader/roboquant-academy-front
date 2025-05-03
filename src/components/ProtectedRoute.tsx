
import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { toast } from '@/components/ui/use-toast';
import { useAdminStatus } from '@/hooks/useAdminStatus';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const { courseId } = useParams<{ courseId: string }>();
  const { isAdmin, isLoading: adminCheckLoading } = useAdminStatus(user?.id);
  const [isEnrolled, setIsEnrolled] = React.useState<boolean | null>(null);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = React.useState<boolean>(!!courseId);

  React.useEffect(() => {
    const checkEnrollment = async () => {
      // Skip enrollment check if no user or no courseId
      if (!user || !courseId) {
        setIsEnrolled(!courseId); // If no courseId, consider as enrolled
        setIsCheckingEnrollment(false);
        return;
      }

      // Always grant access if user is admin
      if (isAdmin) {
        setIsEnrolled(true);
        setIsCheckingEnrollment(false);
        
        // Create enrollment record for admin if it doesn't exist
        // This ensures the course shows up in the admin's dashboard
        const { data: existingEnrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle();
          
        if (!existingEnrollment) {
          try {
            await supabase.from('enrollments').insert({
              user_id: user.id,
              course_id: courseId,
              payment_status: 'completed'
            });
            console.log('Admin enrollment created automatically');
          } catch (error) {
            console.error('Error creating admin enrollment:', error);
          }
        }
        
        return;
      }

      try {
        // Check enrollment status
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle();

        if (enrollmentError && enrollmentError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" error, which is expected if not enrolled
          console.error('Error checking enrollment:', enrollmentError);
          throw enrollmentError;
        }

        setIsEnrolled(!!enrollmentData);
      } catch (error) {
        console.error('Error checking access:', error);
        setIsEnrolled(false);
      } finally {
        setIsCheckingEnrollment(false);
      }
    };

    // Only check enrollment if we have the necessary data and admin status is resolved
    if (!adminCheckLoading && user && courseId) {
      checkEnrollment();
    } else if (!courseId || !user) {
      // No need to check enrollment
      setIsCheckingEnrollment(false);
    }
  }, [user, courseId, isAdmin, adminCheckLoading]);

  const isLoading = authLoading || adminCheckLoading || isCheckingEnrollment;

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (!user) {
    // Redirect to login page while preserving the intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If this is a course page and the user is not enrolled and not admin, redirect to the course page
  if (courseId && !isEnrolled && !isAdmin) {
    toast({
      title: "Access denied",
      description: "You need to enroll in this course to access its content",
      variant: "destructive",
    });
    return <Navigate to={`/courses/${courseId}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
