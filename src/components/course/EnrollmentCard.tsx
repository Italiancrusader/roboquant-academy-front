
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EnrollmentCardProps {
  courseId: string;
  userId: string | undefined;
  courseTitle: string;
  price: number;
  coverImage: string | null;
  enrollment: { id: string } | null;
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
  const navigate = useNavigate();
  const [isEnrolling, setIsEnrolling] = React.useState(false);

  const handleEnroll = async () => {
    if (!userId) {
      navigate('/auth', { state: { from: `/courses/${courseId}` } });
      return;
    }

    setIsEnrolling(true);
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Successfully enrolled",
        description: `You are now enrolled in ${courseTitle}`,
      });

      // After successful enrollment, redirect to the first lesson if available
      if (firstLesson) {
        navigate(`/courses/${courseId}/lessons/${firstLesson}`);
      }
    } catch (error: any) {
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <Card className="sticky top-24">
      {coverImage && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img 
            src={coverImage} 
            alt={courseTitle} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="pt-6 space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">${price.toFixed(2)}</span>
        </div>
        
        {enrollment ? (
          <Button 
            className="w-full bg-green-600 hover:bg-green-700" 
            onClick={() => {
              if (lastAccessedLesson) {
                navigate(`/courses/${courseId}/lessons/${lastAccessedLesson}`);
              } else if (firstLesson) {
                navigate(`/courses/${courseId}/lessons/${firstLesson}`);
              }
            }}
          >
            {lastAccessedLesson ? "Continue Learning" : "Start Course"}
          </Button>
        ) : (
          <Button 
            className="w-full cta-button" 
            onClick={handleEnroll} 
            disabled={isEnrolling}
          >
            {isEnrolling ? "Processing..." : "Enroll Now"}
          </Button>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center">
            <Award className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm">Full lifetime access</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm">Learn at your own pace</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnrollmentCard;
