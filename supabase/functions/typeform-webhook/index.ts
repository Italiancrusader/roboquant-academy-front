
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received webhook from Typeform");
    
    // Parse the webhook payload
    const payload = await req.json();
    console.log("Webhook payload:", JSON.stringify(payload));
    
    // Extract the form response data
    const formResponse = payload.form_response;
    const answers = formResponse.answers;
    const hiddenFields = formResponse.hidden || {};
    
    // Extract user info from hidden fields
    const email = hiddenFields.email || "";
    const firstName = hiddenFields.firstName || "";
    const lastName = hiddenFields.lastName || "";
    const phone = hiddenFields.phone || "";
    
    // Process the answers and determine qualification
    const processedAnswers = {};
    let tradingCapital = "";
    let tradingExperience = "";
    let tradingGoal = "";
    let propFirmUsage = "";
    
    // Map answers to their respective fields
    answers.forEach((answer: any) => {
      const questionId = answer.field.id;
      let value = "";
      
      // Extract the value based on the answer type
      if (answer.type === "choice") {
        value = answer.choice.label;
      } else if (answer.type === "text") {
        value = answer.text;
      } else if (answer.type === "number") {
        value = answer.number;
      }
      
      // Store the answer in the processed object
      processedAnswers[questionId] = value;
      
      // Map specific questions to our qualification criteria
      // Note: You'll need to replace these IDs with the actual question IDs from your Typeform
      if (questionId.includes("trading_capital")) {
        tradingCapital = value;
      } else if (questionId.includes("trading_experience")) {
        tradingExperience = value;
      } else if (questionId.includes("trading_goal")) {
        tradingGoal = value;
      } else if (questionId.includes("prop_firm")) {
        propFirmUsage = value;
      }
    });
    
    // Simplified qualification logic - only check for minimum capital
    const hasMinimumCapital = ["$5,000 – $10,000", "$10,000 – $250,000", "Over $250,000"].includes(tradingCapital);
    
    console.log("Trading capital from typeform:", tradingCapital);
    console.log("Has minimum capital from typeform:", hasMinimumCapital);
    
    // Main qualification gate
    const qualifiesForCall = hasMinimumCapital;
    
    // Save the submission data to Supabase
    const { data, error } = await supabase.from("quiz_submissions").insert([
      {
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        answers: processedAnswers,
        qualifies_for_call: qualifiesForCall,
        submission_date: new Date().toISOString()
      }
    ]);
    
    if (error) {
      console.error("Error saving submission:", error);
    }
    
    // Return the qualification status with the correct qualified value in the URL
    return new Response(
      JSON.stringify({ 
        success: true, 
        qualifiesForCall,
        tradingCapital,
        redirectUrl: qualifiesForCall ? "/book-call" : "/vsl?qualified=false"
      }),
      {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        redirectUrl: "/vsl?qualified=false" // Default redirect on error
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      }
    );
  }
};

serve(handler);
