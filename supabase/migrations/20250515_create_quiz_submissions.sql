
-- Create a table for quiz submissions if it doesn't exist
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  answers JSONB,
  qualifies_for_call BOOLEAN DEFAULT FALSE,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

-- Allow admin users to select all quiz submissions
CREATE POLICY "Admins can view all quiz submissions" 
  ON public.quiz_submissions 
  FOR SELECT 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow anonymous submissions
CREATE POLICY "Anyone can submit quizzes" 
  ON public.quiz_submissions 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);
