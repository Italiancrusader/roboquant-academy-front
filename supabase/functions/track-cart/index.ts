
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface CartTrackingProps {
  userId: string;
  courseId: string;
  cartId: string;
  timestamp: number;
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
    const { userId, courseId, cartId, timestamp }: CartTrackingProps = await req.json();
    
    console.log(`🛒 Tracking cart for user: ${userId}`);
    console.log(`📚 Course ID: ${courseId}`);
    console.log(`🆔 Cart ID: ${cartId}`);
    
    // We could create a cart_tracking table in the database
    // This is just a placeholder for now
    
    // Check if user already has this course
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    
    if (existingEnrollment) {
      console.log(`✅ User already enrolled in course ${courseId}`);
      return new Response(JSON.stringify({ 
        success: true,
        message: "User already enrolled in this course",
        alreadyEnrolled: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // For now, just return success
    console.log(`✅ Cart tracked successfully`);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Cart tracked successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error tracking cart:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
