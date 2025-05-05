
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@1.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0";
import { reEngagementTemplate } from "../utils/email-templates-enhanced.ts";
import { formatDate } from "../../src/utils/emailUtils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface ReengagementProps {
  userId: string;
  lastActiveDate: string;
  recommendedCourseIds?: string[];
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
    const { userId, lastActiveDate, recommendedCourseIds = [], testMode = false }: ReengagementProps = await req.json();
    
    console.log(`🔔 Processing reengagement email for user: ${userId}`);
    console.log(`📅 Last active date: ${lastActiveDate}`);
    
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
    
    // Get recommended courses if IDs are provided
    let recommendedCourses: { title: string, url: string }[] = [];
    
    if (recommendedCourseIds.length > 0) {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title')
        .in('id', recommendedCourseIds);
        
      if (coursesError) {
        console.error("Error fetching recommended courses:", coursesError);
      } else if (coursesData) {
        recommendedCourses = coursesData.map(course => ({
          title: course.title,
          url: `https://roboquant.academy/courses/${course.id}`
        }));
      }
    }
    
    // Prepare email details
    const email = userData.user?.email;
    const firstName = userProfile?.first_name || userData.user?.email?.split('@')[0] || 'Student';
    const formattedLastActive = formatDate(lastActiveDate);
    
    if (!email) {
      throw new Error("User email not found");
    }
    
    console.log(`📧 Sending reengagement email to: ${email}`);
    
    // Determine recipient email based on test mode
    const toEmail = testMode ? "ventos99@gmail.com" : email;
    
    // Send email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "RoboQuant Academy <info@roboquant.ai>",
      to: [toEmail],
      subject: `We Miss You at RoboQuant Academy`,
      html: reEngagementTemplate(
        firstName,
        formattedLastActive,
        recommendedCourses
      )
    });
    
    if (emailError) {
      console.error("📧 Error sending reengagement email:", emailError);
      throw emailError;
    }
    
    console.log(`✅ Reengagement email sent successfully: ${emailData?.id}`);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Reengagement email sent successfully",
      email_id: emailData?.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error in user-reengagement function:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
