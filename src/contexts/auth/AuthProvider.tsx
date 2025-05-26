
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
        console.log("Auth state changed:", event, session?.user?.email_confirmed_at ? "Email confirmed" : "Email not confirmed");
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log("User authenticated:", session.user.email);
          console.log("Email confirmed:", !!session.user.email_confirmed_at);
          
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
              description: `Welcome${session.user.user_metadata?.first_name ? `, ${session.user.user_metadata.first_name}` : ''}!`,
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
      console.log("Attempting sign in for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Sign in error:", error);
        
        // Provide helpful error messages
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the verification link before signing in.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else {
          throw error;
        }
      }
      
      console.log("Sign in successful for:", data.user?.email);
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      console.log("Attempting sign up for:", email);
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
        console.error("Sign up error:", error);
        
        // Provide helpful error messages
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Password should be at least 6 characters')) {
          throw new Error('Password must be at least 6 characters long.');
        } else {
          throw error;
        }
      }
      
      console.log("Sign up response:", data);
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        console.log("User created but email confirmation required");
        toast({
          title: "Account created successfully!",
          description: "Please check your email for a verification link to complete your account setup.",
        });
      } else if (data.session) {
        console.log("User created and automatically signed in");
        toast({
          title: "Account created and signed in!",
          description: `Welcome to RoboQuant${firstName ? `, ${firstName}` : ''}!`,
        });
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
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
