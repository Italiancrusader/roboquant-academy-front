
import React, { useEffect, useState } from 'react';
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
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState<boolean>(!!courseId);
  const [showAccessDenied, setShowAccessDenied] = useState<boolean>(false);

  useEffect(() => {
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
        try {
          const { data: existingEnrollment, error } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .maybeSingle();

          // Only create enrollment if it doesn't exist
          if (!existingEnrollment && !error) {
            try {
              const { error: insertError } = await supabase
                .from('enrollments')
                .insert({
                  user_id: user.id,
                  course_id: courseId,
                  payment_status: 'completed'
                });
                
              if (insertError) {
                console.error('Error creating admin enrollment:', insertError);
              } else {
                console.log('Admin enrollment created automatically');
              }
            } catch (insertError: any) {
              console.error('Error creating admin enrollment:', insertError);
              // We still continue as the admin has access regardless
              // of enrollment record
            }
          }
        } catch (error) {
          console.error('Error checking admin enrollment:', error);
          // Admin still has access regardless of errors
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
        if (!enrollmentData) {
          setShowAccessDenied(true);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setIsEnrolled(false);
        setShowAccessDenied(true);
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

  // Show the access denied toast in a useEffect
  useEffect(() => {
    if (showAccessDenied) {
      toast({
        title: "Access denied",
        description: "You need to enroll in this course to access its content",
        variant: "destructive",
      });
      setShowAccessDenied(false); // Reset the flag to prevent showing the toast again
    }
  }, [showAccessDenied]);

  const isLoading = authLoading || adminCheckLoading || isCheckingEnrollment;

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (!user) {
    // Store the current URL for redirect after login
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // If this is a course page and the user is not enrolled and not admin, redirect to the course page
  if (courseId && !isEnrolled && !isAdmin) {
    return <Navigate to={`/courses/${courseId}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
