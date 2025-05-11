import { useCallback } from 'react';
import { supabase, handleError, Profile, Course } from '@/supabase/client';

export function useSupabase() {
  // Profiles
  const getProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data: data as Profile };
    } catch (error) {
      return handleError(error);
    }
  }, []);

  const updateProfile = useCallback(async (userId: string, updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select('*')
        .single();

      if (error) throw error;
      return { data: data as Profile };
    } catch (error) {
      return handleError(error);
    }
  }, []);

  // Courses
  const getCourses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Course[] };
    } catch (error) {
      return handleError(error);
    }
  }, []);

  const getCourse = useCallback(async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      return { data: data as Course };
    } catch (error) {
      return handleError(error);
    }
  }, []);

  return {
    getProfile,
    updateProfile,
    getCourses,
    getCourse,
  };
} 