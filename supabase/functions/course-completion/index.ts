
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@1.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0";
import { courseCompletionEnhancedTemplate } from "../utils/email-templates-enhanced.ts";
import { formatDate } from "../utils/emailUtils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface CourseCompletionProps {
  userId: string;
  courseId: string;
  testMode?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const { userId, courseId, testMode = false }: CourseCompletionProps = await req.json();
    
    console.log(`🔔 Processing course completion for user: ${userId}`);
    console.log(`📚 Course ID: ${courseId}`);
    
    // Get user profile info
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      throw new Error(`Error fetching user profile: ${userError.message}`);
    }
    
    // Get user email from auth users
    const { data: userData, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError) {
      throw new Error(`Error fetching user data: ${authError.message}`);
    }
    
    // Get course details
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (courseError) {
      throw new Error(`Error fetching course data: ${courseError.message}`);
    }
    
    // Prepare email details
    const email = userData.user?.email;
    const firstName = userProfile?.first_name || userData.user?.email?.split('@')[0] || 'Student';
    
    if (!email) {
      throw new Error("User email not found");
    }
    
    // Generate completion date
    const completionDate = formatDate(new Date());
    
    console.log(`📧 Sending course completion email to: ${email}`);
    
    // Determine recipient email based on test mode
    const toEmail = testMode ? "ventos99@gmail.com" : email;
    
    // Send email using Resend with your verified domain
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Roboquant <team@updates.roboquant.ai>",
      to: [toEmail],
      subject: `Congratulations on Completing ${courseData.title}!`,
      html: courseCompletionEnhancedTemplate(
        firstName,
        courseData.title,
        completionDate
      )
    });
    
    if (emailError) {
      console.error("📧 Error sending course completion email:", emailError);
      throw emailError;
    }
    
    console.log(`✅ Course completion email sent successfully: ${emailData?.id}`);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Course completion email sent successfully",
      email_id: emailData?.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error in course-completion function:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
