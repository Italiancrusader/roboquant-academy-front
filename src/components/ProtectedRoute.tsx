
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { toast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { courseId } = useParams<{ courseId: string }>();
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkAccess = async () => {
      console.log("ProtectedRoute: Checking access...");
      console.log("ProtectedRoute: Course ID:", courseId);
      console.log("ProtectedRoute: User:", user?.id);
      
      if (!user) {
        console.log("ProtectedRoute: No user, denying access");
        setIsAdmin(false);
        setIsEnrolled(false);
        setIsChecking(false);
        return;
      }

      try {
        // Check if user is admin
        console.log("ProtectedRoute: Checking if user is admin...");
        const { data: adminData, error: adminError } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });
        
        if (adminError) {
          console.error('ProtectedRoute: Error checking admin status:', adminError);
          throw adminError;
        }
        
        const userIsAdmin = !!adminData;
        console.log("ProtectedRoute: Is user admin?", userIsAdmin);
        setIsAdmin(userIsAdmin);
        
        // If admin or no courseId provided, they have access
        if (userIsAdmin || !courseId) {
          console.log("ProtectedRoute: Access granted - user is admin or no course ID specified");
          setIsEnrolled(true);
          setIsChecking(false);
          return;
        }

        // If not admin, check enrollment
        console.log("ProtectedRoute: Checking enrollment for course:", courseId);
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle();

        if (enrollmentError && enrollmentError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" error, which is expected if not enrolled
          console.error('ProtectedRoute: Error checking enrollment:', enrollmentError);
          throw enrollmentError;
        }

        console.log("ProtectedRoute: Enrollment check result:", enrollmentData ? "Enrolled" : "Not enrolled");
        setIsEnrolled(!!enrollmentData);
      } catch (error) {
        console.error('ProtectedRoute: Error checking access:', error);
        // Default to no access on error
        setIsAdmin(false);
        setIsEnrolled(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [user, courseId]);

  if (isLoading || isChecking) {
    return <LoadingAnimation />;
  }

  if (!user) {
    // Redirect to login page while preserving the intended destination
    console.log("ProtectedRoute: Redirecting to auth - no user");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If this is a course page and the user is not enrolled or admin, redirect to the course page
  if (courseId && !isEnrolled && !isAdmin) {
    console.log("ProtectedRoute: Redirecting to course page - not enrolled or admin");
    return <Navigate to={`/courses/${courseId}`} replace />;
  }

  console.log("ProtectedRoute: Access granted");
  return <>{children}</>;
};

export default ProtectedRoute;
