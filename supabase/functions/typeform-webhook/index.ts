
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow requests from any origin
  "Access-Control-Allow-Methods": "POST, OPTIONS", // Allow POST and OPTIONS
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with, origin, accept",
  "Access-Control-Max-Age": "86400", // Cache CORS preflight requests for 24 hours
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const handler = async (req: Request): Promise<Response> => {
  console.log("Typeform webhook received request:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      status: 204, // No content status is appropriate for OPTIONS
      headers: corsHeaders 
    });
  }

  try {
    if (req.method !== "POST") {
      console.log(`Invalid method: ${req.method}, expected POST`);
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Parse the webhook payload
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
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload", details: error.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Extract the form response data
    const formResponse = payload.form_response;
    if (!formResponse) {
      console.error("Missing form_response in payload");
      return new Response(
        JSON.stringify({ error: "Missing form_response in payload" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const answers = formResponse.answers;
    const hiddenFields = formResponse.hidden || {};
    
    // Extract user info from hidden fields
    const email = hiddenFields.email || "";
    const firstName = hiddenFields.firstName || "";
    const lastName = hiddenFields.lastName || "";
    const phone = hiddenFields.phone || "";
    
    console.log("Extracted user info from hidden fields:", { email, firstName, lastName, phone });
    
    // Process the answers and determine qualification
    const processedAnswers = {};
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
    } else if (tradingCapital === "$10k-$250k") {
      mappedTradingCapital = "$10,000 – $250,000";
    } else if (tradingCapital === "> $250k") {
      mappedTradingCapital = "Over $250,000";
    }
    
    // Simplified qualification logic - only check for minimum capital
    const approvedCapitalValues = ["$5,000 – $10,000", "$10,000 – $250,000", "Over $250,000"];
    const hasMinimumCapital = approvedCapitalValues.includes(mappedTradingCapital);
    
    console.log("DEBUG TYPEFORM WEBHOOK - All processed answers:", JSON.stringify(processedAnswers));
    console.log("DEBUG TYPEFORM WEBHOOK - Original trading capital:", tradingCapital);
    console.log("DEBUG TYPEFORM WEBHOOK - Mapped trading capital:", mappedTradingCapital);
    console.log("DEBUG TYPEFORM WEBHOOK - Approved capital values:", JSON.stringify(approvedCapitalValues));
    console.log("DEBUG TYPEFORM WEBHOOK - Has minimum capital?", hasMinimumCapital);
    console.log("DEBUG TYPEFORM WEBHOOK - includes() result:", approvedCapitalValues.includes(mappedTradingCapital));
    
    // Main qualification gate
    const qualifiesForCall = hasMinimumCapital;
    
    // Save the submission data to Supabase
    try {
      console.log("Saving submission to Supabase");
      const { data, error } = await supabase.from("quiz_submissions").insert([
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
            has_minimum_capital: hasMinimumCapital,
            qualifies_for_call: qualifiesForCall,
            approved_values: approvedCapitalValues,
            raw_answers: answers,
            raw_payload: payload
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

    const redirectUrl = qualifiesForCall ? "/book-call" : "/vsl?qualified=false";
    console.log("DEBUG TYPEFORM WEBHOOK - Redirect URL:", redirectUrl);
    
    // Return the qualification status with the correct qualified value in the URL
    const responseBody = {
      success: true, 
      qualifiesForCall,
      tradingCapital: mappedTradingCapital,
      redirectUrl
    };
    
    console.log("Sending successful response:", responseBody);
    return new Response(
      JSON.stringify(responseBody),
      {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      }
    );
  } catch (error) {
    console.error("Unhandled error in typeform-webhook:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        redirectUrl: "/vsl?qualified=false", // Default redirect on error
        stack: error.stack // Include stack trace for debugging
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

console.log("Typeform webhook function initialized and ready");
serve(handler);
