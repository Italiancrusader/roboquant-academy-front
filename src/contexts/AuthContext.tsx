
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // If this is a new sign-in event, show a welcome toast
        if (event === 'SIGNED_IN' && session?.user) {
          toast({
            title: "Successfully signed in",
            description: `Welcome${session.user.user_metadata?.name ? `, ${session.user.user_metadata.name}` : ''}!`,
          });
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "Session found" : "No session");
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    }).catch(error => {
      console.error("Error checking session:", error);
      setIsLoading(false);
    });

    // Process auth errors in URL hash or search params
    const processUrlErrors = () => {
      // Process hash fragment (common with OAuth redirects)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');
      
      // Process search params
      const urlParams = new URLSearchParams(window.location.search);
      const urlError = urlParams.get('error');
      const urlErrorDescription = urlParams.get('error_description');
      
      // Current full URL for debugging
      console.log("Current URL during auth check:", window.location.href);
      
      // Check for hash fragment or URL errors
      if (error || errorDescription || urlError || urlErrorDescription) {
        const errorMsg = errorDescription || error || urlErrorDescription || urlError || "Authentication error";
        console.error("Auth error detected in URL:", errorMsg);
        
        toast({
          title: "Authentication Error",
          description: errorMsg,
          variant: "destructive",
        });
        
        // Clean up URL
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, document.title, window.location.pathname);
        }
      }
    };
    
    processUrlErrors();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Get the absolute current URL without hash or search params
      const baseUrl = window.location.origin;
      
      // Always use /auth as the redirect path - this ensures users land on the auth page after OAuth
      const redirectTo = `${baseUrl}/auth`;
      
      // Log the redirect URL for debugging
      console.log("Google sign-in with redirect to:", redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            // These help with token refreshing and provide an improved user experience
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error("Google OAuth initialization error:", error);
        throw error;
      }
      
      if (data?.url) {
        console.log("OAuth redirect URL:", data.url);
        // Force the browser to use this URL instead of relying on automatic redirect
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Google sign-in exception:", error);
      toast({
        title: "Google sign in failed",
        description: error.message || "Failed to connect to Google authentication service",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
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
        throw error;
      }
      
      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
