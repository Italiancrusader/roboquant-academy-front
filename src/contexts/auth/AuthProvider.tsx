
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { AuthContextProps } from './types';
import { processUrlErrors, handleHashTokens } from './auth-utils';

// Create the context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Initializing AuthProvider...");
    const domain = window.location.hostname;
    console.log("Current domain:", domain);
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log("User authenticated:", session.user.email);
          
          // Check user roles after authentication
          const checkUserRoles = async () => {
            try {
              console.log("Checking user roles for:", session.user.id);
              const { data: isAdmin, error } = await supabase.rpc('has_role', {
                _user_id: session.user.id,
                _role: 'admin',
              });
              
              if (error) {
                console.error("Error checking admin status:", error);
              } else {
                console.log("User admin status:", isAdmin ? "Is Admin" : "Not Admin");
              }
            } catch (error) {
              console.error("Failed to check user roles:", error);
            }
          };
          
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(checkUserRoles, 0);
          
          // If this is a new sign-in event, show a welcome toast
          if (event === 'SIGNED_IN') {
            toast({
              title: "Successfully signed in",
              description: `Welcome${session.user.user_metadata?.name ? `, ${session.user.user_metadata.name}` : ''}!`,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
        }
      }
    );

    // Handle hash fragment tokens if present (for OAuth callbacks landing on root)
    const recoverSession = async () => {
      console.log("Attempting to recover session from URL tokens...");
      const recoveredSession = await handleHashTokens();
      if (recoveredSession) {
        console.log("Session recovered from URL tokens");
        setSession(recoveredSession);
        setUser(recoveredSession.user);
      }
    };
    
    recoverSession();

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
      // Get the current URL to determine environment
      const currentUrl = window.location.href;
      
      // Domain detection logic
      let baseUrl = '';
      if (currentUrl.includes('localhost') || currentUrl.includes('lovableproject.com')) {
        // Local/preview environment
        baseUrl = window.location.origin;
      } else {
        // Production environment - do NOT use www prefix
        baseUrl = 'https://roboquant.ai';
      }
      
      // Always use /auth as the redirect path
      const redirectTo = `${baseUrl}/auth`;
      
      // Log the redirect URL for debugging
      console.log("Google sign-in with redirect to:", redirectTo);
      console.log("Current environment:", baseUrl === window.location.origin ? "Development/Preview" : "Production");
      
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
        console.log("OAuth redirect URL generated by Supabase:", data.url);
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

// Export the hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
