
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { trackEvent } from '@/utils/googleAnalytics';
import { trackCompleteRegistration } from '@/utils/metaPixel';
import { trackCompleteRegistrationConversionsAPI } from '@/utils/metaConversionsApi';

export const useSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Starting sign up process for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        console.error('❌ Sign up error:', error);
        throw error;
      }

      if (data.user) {
        console.log('✅ User created successfully:', data.user.id);
        
        // Track registration completion
        trackEvent('sign_up', {
          event_category: 'Authentication',
          event_label: 'User Registration',
        });

        // Track Meta Pixel CompleteRegistration event
        trackCompleteRegistration({
          content_name: 'RoboQuant Academy Registration'
        });

        // Track Meta Conversions API CompleteRegistration event
        trackCompleteRegistrationConversionsAPI({
          userData: {
            email,
            firstName,
            lastName,
          },
          contentName: 'RoboQuant Academy Registration',
        }).catch(error => {
          console.error('Failed to send CompleteRegistration Conversions API event:', error);
        });

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        
        return { data, error: null };
      }
    } catch (error: any) {
      console.error('❌ Sign up failed:', error);
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up",
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { signUp, isLoading };
};
