import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import CoursePreview from './CoursePreview';

interface EnrollmentCardProps {
  courseId: string;
  userId: string | undefined;
  courseTitle: string;
  price: number;
  coverImage: string | null;
  enrollment: { id: string; enrolled_at: string } | null;
  firstLesson: string | null;
  lastAccessedLesson: string | null;
}

const EnrollmentCard = ({
  courseId,
  userId,
  courseTitle,
  price,
  coverImage,
  enrollment,
  firstLesson,
  lastAccessedLesson,
}: EnrollmentCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminAccess, setIsAdminAccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useAdminStatus(user?.id);

  // Check if the user is an admin and grant access automatically
  useEffect(() => {
    if (isAdmin && userId && !enrollment) {
      setIsAdminAccess(true);
    }
  }, [isAdmin, userId, enrollment]);

  const handleEnrollment = async () => {
    setIsLoading(true);
    try {
      // If user is admin, create enrollment directly
      if (isAdmin) {
        try {
          // Using the service role in an edge function would be more secure,
          // but for admin users, this client-side approach should work with proper RLS
          const { error: enrollError } = await supabase
            .from('enrollments')
            .insert({
              user_id: userId,
              course_id: courseId,
              payment_status: 'completed'
            });
            
          if (enrollError) {
            console.error("Enrollment error:", enrollError);
            throw new Error(enrollError.message || "Failed to enroll");
          }
          
          toast({
            title: "Access granted",
            description: "As an admin, you've been given direct access to this course.",
          });
          
          // Reload the page to show enrollment status
          window.location.reload();
        } catch (error: any) {
          console.error("Admin enrollment error:", error);
          toast({
            title: "Enrollment error",
            description: "There was an error granting access. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }
      
      // For non-authenticated users or regular users, redirect to survey
      navigate('/survey');
    } catch (error: any) {
      toast({
        title: "Enrollment error",
        description: error.message || "An error occurred during enrollment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (lastAccessedLesson) {
      navigate(`/courses/${courseId}/lessons/${lastAccessedLesson}`);
    } else if (firstLesson) {
      navigate(`/courses/${courseId}/lessons/${firstLesson}`);
    } else {
      toast({
        title: "No lessons available",
        description: "This course does not have any lessons yet.",
        variant: "destructive",
      });
    }
  };

  // If user is admin but not enrolled, show auto-enrollment button
  if (isAdmin && !enrollment && !isAdminLoading) {
    return (
      <div className="space-y-4">
        <Card className="sticky top-24 overflow-hidden">
          {coverImage && (
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={coverImage} 
                alt={courseTitle} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="mb-4">
                <Badge className="bg-blue-500 text-white">Admin Access</Badge>
                <p className="text-sm mt-2">
                  As an admin, you can access this course directly
                </p>
              </div>
              
              <Button 
                className="w-full cta-button"
                onClick={handleEnrollment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Granting access...
                  </>
                ) : "Access Course"}
              </Button>
            </div>
            
            <CoursePreview 
              courseTitle={courseTitle}
              previewVideoUrl="https://player.vimeo.com/video/917495861" 
              previewImage="/lovable-uploads/56e1912c-6199-4933-a4e9-409fbe7e9311.png" 
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular enrollment card for non-admin users or already enrolled admins
  return (
    <div className="space-y-4">
      <Card className="sticky top-24 overflow-hidden">
        {coverImage && (
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={coverImage} 
              alt={courseTitle} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-6">
          <div className="mb-6">
            {enrollment ? (
              <div className="mb-4">
                <Badge className="bg-green-500 text-white">Enrolled</Badge>
                <p className="text-sm mt-2">
                  Enrolled on {new Date(enrollment.enrolled_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex items-baseline mb-2">
                  <span className="text-3xl font-bold">${price}</span>
                  <span className="text-sm ml-2 text-muted-foreground line-through">${(price * 1.25).toFixed(2)}</span>
                  <span className="ml-2 text-sm bg-green-500/20 text-green-500 py-0.5 px-2 rounded-full">20% off</span>
                </div>
                <ul className="text-sm space-y-2 mb-4">
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Full lifetime access</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Access on mobile and desktop</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Community support</span>
                  </li>
                </ul>
                <Button 
                  className="w-full cta-button"
                  onClick={handleEnrollment}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : "Enroll Now"}
                </Button>
              </div>
            )}
            
            {enrollment && (
              <Button className="w-full cta-button" onClick={handleContinue}>
                {lastAccessedLesson ? "Continue Learning" : "Start Learning"}
              </Button>
            )}
          </div>
          
          {!enrollment && (
            <CoursePreview 
              courseTitle={courseTitle}
              previewVideoUrl="https://player.vimeo.com/video/917495861" 
              previewImage="/lovable-uploads/56e1912c-6199-4933-a4e9-409fbe7e9311.png" 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentCard;
