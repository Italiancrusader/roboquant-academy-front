
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Enhanced CORS headers to ensure proper communication with Typeform
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow requests from any origin
  "Access-Control-Allow-Methods": "POST, OPTIONS", // Allow POST and OPTIONS
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with, origin, accept, X-Requested-With",
  "Access-Control-Max-Age": "86400", // Cache CORS preflight requests for 24 hours
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to ensure consistent response format
const createResponse = (body: any, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Typeform webhook received request:", req.method);
  
  // Handle CORS preflight requests first
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      status: 204, // No content status is appropriate for OPTIONS
      headers: corsHeaders 
    });
  }

  try {
    // Only allow POST method
    if (req.method !== "POST") {
      console.log(`Invalid method: ${req.method}, expected POST`);
      return createResponse({ 
        error: "Method not allowed",
        success: false,
        redirectUrl: "/vsl?qualified=false" // Default redirect for errors
      }, 405);
    }
    
    // Parse the webhook payload with error handling
    let payload;
    try {
      console.log("Attempting to parse request body");
      payload = await req.json();
      console.log("Request body parsed successfully");
      console.log("Webhook payload summary:", {
        form_id: payload.form_id,
        event_id: payload.event_id,
        event_type: payload.event_type,
        has_hidden_fields: !!payload.form_response?.hidden,
        answer_count: payload.form_response?.answers?.length || 0
      });
    } catch (error) {
      console.error("Error parsing webhook payload:", error);
      return createResponse({
        error: "Invalid JSON payload",
        details: error.message,
        success: false,
        redirectUrl: "/vsl?qualified=false" // Default redirect for errors
      }, 400);
    }
    
    // Extract the form response data
    const formResponse = payload.form_response;
    if (!formResponse) {
      console.error("Missing form_response in payload");
      return createResponse({
        error: "Missing form_response in payload",
        success: false,
        redirectUrl: "/vsl?qualified=false" // Default redirect for errors
      }, 400);
    }
    
    const answers = formResponse.answers || [];
    const hiddenFields = formResponse.hidden || {};
    
    // Extract user info from hidden fields
    const email = hiddenFields.email || "";
    const firstName = hiddenFields.firstName || "";
    const lastName = hiddenFields.lastName || "";
    const phone = hiddenFields.phone || "";
    
    console.log("Extracted user info from hidden fields:", { email, firstName, lastName, phone });
    
    // Process the answers and determine qualification
    const processedAnswers: Record<string, any> = {};
    let tradingCapital = "";
    let tradingExperience = "";
    let tradingGoal = "";
    let propFirmUsage = "";
    
    // Map answers to their respective fields
    answers.forEach((answer: any) => {
      const questionId = answer.field.id;
      const questionRef = answer.field.ref;
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
      // Look for trading_capital in both ID and ref fields for robustness
      if (questionId.includes("trading_capital") || 
          (questionRef && questionRef.includes("trading_capital")) ||
          questionId === "Po4vFV7bfrWA" || // Specific ID for trading capital question
          (answer.field.title && answer.field.title.toLowerCase().includes("capital"))) {
        tradingCapital = value;
        console.log("Found trading capital question:", { id: questionId, ref: questionRef, value });
      } else if (questionId.includes("trading_experience") || 
                (questionRef && questionRef.includes("trading_experience")) ||
                questionId === "aUPi2xOQ3bgw" || // Specific ID for experience question
                (answer.field.title && answer.field.title.toLowerCase().includes("been trading"))) {
        tradingExperience = value;
        console.log("Found trading experience question:", { id: questionId, ref: questionRef, value });
      } else if (questionId.includes("trading_goal") || 
                (questionRef && questionRef.includes("goal")) ||
                questionId === "PKKTmblAkQtJ" || 
                (answer.field.title && answer.field.title.toLowerCase().includes("goal"))) {
        tradingGoal = value;
        console.log("Found trading goal question:", { id: questionId, ref: questionRef, value });
      } else if (questionId.includes("prop_firm") || 
                (questionRef && questionRef.includes("prop_firm")) ||
                questionId === "BQ1g9TyuA6G6" ||
                (answer.field.title && answer.field.title.toLowerCase().includes("prop-firm"))) {
        propFirmUsage = value;
        console.log("Found prop firm question:", { id: questionId, ref: questionRef, value });
      }
    });
    
    // Log all question IDs and values for debugging
    console.log("All Typeform question IDs and answers:", JSON.stringify(
      answers.map((a: any) => ({ 
        id: a.field.id, 
        title: a.field.title,
        type: a.type, 
        value: a[a.type] // Value based on answer type
      }))
    ));
    
    // Map Typeform values to our application format for consistency
    let mappedTradingCapital = tradingCapital;
    
    if (tradingCapital === "< $1k") {
      mappedTradingCapital = "Under $1,000";
    } else if (tradingCapital === "$1k-$5k") {
      mappedTradingCapital = "$1,000 – $5,000";
    } else if (tradingCapital === "$5k-$10k") {
      mappedTradingCapital = "$5,000 – $10,000";
    } else if (tradingCapital === "$10k-$25k" || tradingCapital === "$10k-$250k") {
      mappedTradingCapital = "$10,000 – $250,000";
    } else if (tradingCapital === "> $25k" || tradingCapital === "> $250k") {
      mappedTradingCapital = "Over $250,000";
    }
    
    console.log("DEBUG TYPEFORM WEBHOOK - Original trading capital:", tradingCapital);
    console.log("DEBUG TYPEFORM WEBHOOK - Mapped trading capital:", mappedTradingCapital);
    
    // CRITICAL FIX: Direct qualification check for higher capital values ("> $25k") - fixed logic!
    let qualifiesForCall = false;
    
    // First check specifically for high capital values which should always qualify
    if (tradingCapital === "> $25k" || tradingCapital === "> $250k" || tradingCapital === "Haa2tZ1srkPu") {
      console.log("DEBUG TYPEFORM WEBHOOK - Direct qualification for high capital value:", tradingCapital);
      qualifiesForCall = true;
    } 
    // Then check other cases against approved values
    else {
      const approvedCapitalValues = ["$5,000 – $10,000", "$10,000 – $250,000", "Over $250,000"];
      qualifiesForCall = approvedCapitalValues.includes(mappedTradingCapital);
    }
    
    console.log("DEBUG TYPEFORM WEBHOOK - All processed answers:", JSON.stringify(processedAnswers));
    console.log("DEBUG TYPEFORM WEBHOOK - Has minimum capital?", qualifiesForCall);
    console.log("DEBUG TYPEFORM WEBHOOK - Final qualification status:", qualifiesForCall);
    
    // Save the submission data to Supabase with error handling
    try {
      console.log("Saving submission to Supabase");
      const { error } = await supabase.from("quiz_submissions").insert([
        {
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
          answers: processedAnswers,
          qualifies_for_call: qualifiesForCall,
          submission_date: new Date().toISOString(),
          debug_info: {
            original_trading_capital: tradingCapital,
            mapped_trading_capital: mappedTradingCapital,
            qualifies_for_call: qualifiesForCall,
            approved_values: ["$5,000 – $10,000", "$10,000 – $250,000", "Over $250,000"],
            raw_answers: answers,
          }
        }
      ]);
      
      if (error) {
        console.error("Error saving submission to Supabase:", error);
        // Continue with the response even if saving fails
      } else {
        console.log("Successfully saved submission to Supabase");
      }
    } catch (dbError) {
      console.error("Exception when saving to database:", dbError);
      // Continue with the response even if saving fails
    }

    // Set correct redirect URL based on qualification status
    const redirectUrl = qualifiesForCall ? "/book-call" : "/vsl?qualified=false";
    console.log("DEBUG TYPEFORM WEBHOOK - Redirect URL:", redirectUrl);
    
    // Return the qualification status with the correct redirect URL
    return createResponse({
      success: true, 
      qualifiesForCall,
      tradingCapital,
      redirectUrl
    });
  } catch (error) {
    console.error("Unhandled error in typeform-webhook:", error);
    return createResponse({ 
      success: false, 
      error: error.message,
      redirectUrl: "/vsl?qualified=false", // Default redirect on error
      stack: error.stack // Include stack trace for debugging
    }, 500);
  }
};

console.log("Typeform webhook function initialized and ready");
serve(handler);
