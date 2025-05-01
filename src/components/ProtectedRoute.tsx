
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LoadingAnimation from '@/components/LoadingAnimation';

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
      if (!user || !courseId) {
        setIsAdmin(false);
        setIsEnrolled(false);
        setIsChecking(false);
        return;
      }

      try {
        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });
        
        if (adminError) throw adminError;
        
        if (adminData) {
          // If admin, they have access to everything
          setIsAdmin(true);
          setIsEnrolled(true);
          setIsChecking(false);
          return;
        }

        // If not admin, check enrollment
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();

        if (enrollmentError && enrollmentError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" error, which is expected if not enrolled
          throw enrollmentError;
        }

        setIsEnrolled(!!enrollmentData);
      } catch (error) {
        console.error('Error checking access:', error);
      } finally {
        setIsChecking(false);
      }
    };

    if (user && courseId) {
      checkAccess();
    } else {
      setIsChecking(false);
    }
  }, [user, courseId]);

  if (isLoading || isChecking) {
    return <LoadingAnimation />;
  }

  if (!user) {
    // Redirect to login page while preserving the intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If this is a course page and the user is not enrolled or admin, redirect to the course page
  if (courseId && !isEnrolled && !isAdmin) {
    return <Navigate to={`/courses/${courseId}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
