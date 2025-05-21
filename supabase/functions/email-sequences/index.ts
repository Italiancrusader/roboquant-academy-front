
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, origin, accept",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Configuration for the email sequences
const EMAIL_SEQUENCES = {
  qualified: [
    { type: "qualified", delayDays: 0 }, // Immediate
    { type: "reminder", delayDays: 2 }, // 2 days later if they haven't booked
    { type: "educational", delayDays: 5, data: { lessonNumber: 1 } }, // 5 days after qualification
    { type: "reminder", delayDays: 7 }, // 7 days after qualification if still not booked
    { type: "educational", delayDays: 12, data: { lessonNumber: 2 } }, // 12 days after qualification
    { type: "special-offer", delayDays: 20 }, // 20 days after qualification if not converted
    { type: "re-engagement", delayDays: 30 } // 30 days after qualification if not converted
  ],
  nonQualified: [
    { type: "non-qualified", delayDays: 0 }, // Immediate
    { type: "educational", delayDays: 3, data: { lessonNumber: 1 } }, // 3 days after non-qualification
    { type: "educational", delayDays: 8, data: { lessonNumber: 2 } }, // 8 days after non-qualification
    { type: "special-offer", delayDays: 15 }, // 15 days after non-qualification if not converted
    { type: "re-engagement", delayDays: 30 } // 30 days after non-qualification if not converted
  ]
};

// This function will be triggered by a webhook from the typeform-webhook function
// or can be called manually to set up email sequences for leads
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const { leadId, qualification, additionalData } = await req.json();
    
    if (!leadId) {
      throw new Error("Lead ID is required");
    }
    
    // Check if the lead exists
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
      
    if (leadError) {
      throw new Error(`Error fetching lead: ${leadError.message}`);
    }
    
    if (!lead) {
      throw new Error("Lead not found");
    }
    
    // Determine which sequence to use based on qualification
    const sequenceType = qualification === "qualified" ? "qualified" : "nonQualified";
    const sequence = EMAIL_SEQUENCES[sequenceType];
    
    // Schedule each email in the sequence
    const now = new Date();
    const scheduledEmails = sequence.map(email => {
      const sendDate = new Date(now.getTime());
      sendDate.setDate(now.getDate() + email.delayDays);
      
      return {
        lead_id: leadId,
        email_type: email.type,
        scheduled_date: sendDate.toISOString(),
        status: 'scheduled',
        additional_data: {
          ...email.data,
          ...additionalData,
          qualification: qualification
        }
      };
    });
    
    // Insert the scheduled emails into the database
    const { data: insertedEmails, error: insertError } = await supabase
      .from('email_schedule')
      .insert(scheduledEmails)
      .select();
      
    if (insertError) {
      throw new Error(`Error scheduling emails: ${insertError.message}`);
    }
    
    console.log(`Successfully scheduled ${scheduledEmails.length} emails for lead ${leadId}`);
    
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: `Email sequence started for lead ${leadId}`,
      scheduledCount: scheduledEmails.length,
      sequence: sequenceType
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
    
  } catch (error: any) {
    console.error(`Error setting up email sequence: ${error.message}`);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};

serve(handler);
