
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to process scheduled emails
const processScheduledEmails = async () => {
  try {
    const now = new Date().toISOString();
    
    // Get all emails scheduled to be sent now or in the past
    const { data: scheduledEmails, error: fetchError } = await supabase
      .from('email_schedule')
      .select(`
        id, 
        lead_id, 
        email_type, 
        scheduled_date, 
        status, 
        additional_data,
        leads (
          name, 
          email
        )
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_date', now)
      .order('scheduled_date', { ascending: true })
      .limit(20); // Process in batches to avoid timeout
      
    if (fetchError) {
      throw new Error(`Error fetching scheduled emails: ${fetchError.message}`);
    }
    
    if (!scheduledEmails || scheduledEmails.length === 0) {
      return { processed: 0, message: "No emails scheduled for processing" };
    }
    
    console.log(`Found ${scheduledEmails.length} emails to process`);
    
    const results = [];
    
    // Process each scheduled email
    for (const email of scheduledEmails) {
      try {
        // For emails that depend on user actions, check if they're still relevant
        if (email.email_type === 'reminder') {
          // Check if the user has already booked a call
          const { data: bookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('lead_id', email.lead_id)
            .limit(1);
            
          if (bookings && bookings.length > 0) {
            // User has already booked, so mark this email as skipped
            await supabase
              .from('email_schedule')
              .update({ 
                status: 'skipped',
                processed_date: new Date().toISOString(),
                notes: 'User already booked a call'
              })
              .eq('id', email.id);
              
            results.push({
              id: email.id,
              status: 'skipped',
              reason: 'User already booked a call'
            });
            
            continue; // Skip to next email
          }
        }
        
        // Call the survey-emails function to send the email
        const response = await fetch(`${supabaseUrl}/functions/v1/survey-emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            emailType: email.email_type,
            recipientId: email.lead_id,
            recipientName: email.leads?.name,
            recipientEmail: email.leads?.email,
            additionalData: email.additional_data || {}
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to send email: ${errorData.error || response.statusText}`);
        }
        
        // Update the email status to sent
        await supabase
          .from('email_schedule')
          .update({ 
            status: 'sent',
            processed_date: new Date().toISOString()
          })
          .eq('id', email.id);
          
        results.push({
          id: email.id,
          status: 'sent',
          recipientEmail: email.leads?.email
        });
        
      } catch (emailError) {
        console.error(`Error processing email ${email.id}:`, emailError);
        
        // Mark as failed
        await supabase
          .from('email_schedule')
          .update({ 
            status: 'failed',
            processed_date: new Date().toISOString(),
            notes: emailError.message
          })
          .eq('id', email.id);
          
        results.push({
          id: email.id,
          status: 'failed',
          error: emailError.message
        });
      }
    }
    
    return { 
      processed: scheduledEmails.length,
      results: results
    };
    
  } catch (error) {
    console.error("Error in processScheduledEmails:", error);
    return { error: error.message };
  }
};

// Handler for the edge function
const handler = async (req: Request): Promise<Response> => {
  try {
    // This can be called by a cron job
    const result = await processScheduledEmails();
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error: any) {
    console.error(`Error processing scheduled emails: ${error.message}`);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

serve(handler);
