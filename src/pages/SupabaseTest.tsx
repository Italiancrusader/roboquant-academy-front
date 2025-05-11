import React, { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { supabase } from '@/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const SupabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [error, setError] = useState<string | null>(null);
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [courses, setCourses] = useState<any[]>([]);
  const [userCount, setUserCount] = useState<number | null>(null);
  
  const { getCourses } = useSupabase();

  useEffect(() => {
    // Display the Supabase URL (with API key redacted)
    const url = import.meta.env.VITE_SUPABASE_URL || 'Not configured';
    setSupabaseUrl(url);

    // Test the connection
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionStatus('testing');
    setError(null);
    
    try {
      // Simple health check
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      
      if (error) {
        throw error;
      }
      
      // Set the count as a number
      setUserCount(typeof data === 'number' ? data : 0);
      setConnectionStatus('success');
      
      // Try to fetch courses
      const coursesResult = await getCourses();
      if ('error' in coursesResult && coursesResult.error) {
        console.warn('Could not fetch courses:', coursesResult.error);
      } else if ('data' in coursesResult) {
        setCourses(coursesResult.data || []);
      }
      
    } catch (err: any) {
      console.error('Supabase connection error:', err);
      setConnectionStatus('error');
      setError(err.message || 'Unknown error connecting to Supabase');
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>Testing connection to Supabase instance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4"><strong>Supabase URL:</strong> {supabaseUrl}</p>
          <p className="mb-4">
            <strong>Status:</strong>{' '}
            {connectionStatus === 'testing' && 'Testing connection...'}
            {connectionStatus === 'success' && <span className="text-green-500">Connected successfully!</span>}
            {connectionStatus === 'error' && <span className="text-red-500">Connection failed</span>}
          </p>
          
          {error && (
            <p className="text-red-500 p-4 bg-red-50 rounded-md">
              {error}
            </p>
          )}
          
          {userCount !== null && (
            <p className="mt-4"><strong>Profile Count:</strong> {userCount}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
            {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection Again'}
          </Button>
        </CardFooter>
      </Card>
      
      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
            <CardDescription>Courses fetched from Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {courses.map((course) => (
                <div key={course.id} className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                  <p className="text-gray-500">{course.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {connectionStatus === 'success' && courses.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Courses Found</CardTitle>
            <CardDescription>Connection successful, but no courses were found</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This could be because:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>The courses table doesn't exist yet</li>
              <li>There are no published courses</li>
              <li>Your user doesn't have access to the courses table</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupabaseTest; 