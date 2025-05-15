
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Enhanced CORS headers to ensure proper browser support
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": 
    "authorization, x-client-info, apikey, content-type, origin, accept",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400"
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders, 
      status: 200 
    });
  }

  try {
    console.log("Received webhook from Typeform");
    
    // Parse the webhook payload
    const payload = await req.json().catch(error => {
      console.error("Error parsing webhook payload:", error);
      throw new Error("Invalid JSON payload");
    });
    
    console.log("Webhook payload:", JSON.stringify(payload));
    
    if (!payload || !payload.form_response) {
      console.warn("Invalid webhook payload format");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid payload format",
          redirectUrl: "/book-call" // Default redirect on error for better UX
        }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          }
        }
      );
    }
    
    // Extract the form response data
    const formResponse = payload.form_response;
    const answers = formResponse?.answers || [];
    const hiddenFields = formResponse?.hidden || {};
    
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
      const questionId = answer.field?.id;
      const fieldRef = answer.field?.ref;
      let value = "";
      
      // Extract the value based on the answer type
      if (answer.type === "choice") {
        value = answer.choice?.label || "";
      } else if (answer.type === "text") {
        value = answer.text || "";
      } else if (answer.type === "number") {
        value = answer.number?.toString() || "";
      }
      
      // Store the answer in the processed object
      if (questionId) {
        processedAnswers[questionId] = value;
      }
      
      // Map specific questions to our qualification criteria
      // Trading capital question
      if (fieldRef && fieldRef.includes("bc58b7b4-c80f-4e7b-baf7-367a9b5cfa52")) {
        tradingCapital = value;
        console.log("Found trading capital value:", value);
      } 
      // Trading experience question
      else if (fieldRef && fieldRef.includes("aa27c676-b783-4047-a535-93ad0e36613c")) {
        tradingExperience = value;
      } 
      // Trading goal question
      else if (fieldRef && fieldRef.includes("c93242f6-c837-430f-b482-6a31745f5990")) {
        tradingGoal = value;
      } 
      // Prop firm usage question
      else if (fieldRef && fieldRef.includes("cf017582-0450-41ea-a997-83e42f981f85")) {
        propFirmUsage = value;
      }
    });
    
    // Log the trading capital for debugging
    console.log("Trading capital extracted:", tradingCapital);
    
    // Qualification logic with expanded checks for different formats of capital amounts
    const hasMinimumCapital = checkMinimumCapital(tradingCapital);
    
    // Main qualification gate
    const qualifiesForCall = hasMinimumCapital;

    console.log("Qualification status:", qualifiesForCall);
    console.log("Has minimum capital:", hasMinimumCapital);
    
    // Determine redirect URL based on qualification
    const redirectUrl = qualifiesForCall ? "/book-call" : "/checkout";
    console.log("Redirect URL:", redirectUrl);
    
    // Save the submission data to Supabase with better error handling
    if (email) {
      try {
        const { data, error } = await supabase.from("quiz_submissions").insert([
          {
            email,
            first_name: firstName,
            last_name: lastName,
            phone,
            answers: processedAnswers,
            qualifies_for_call: qualifiesForCall,
            submission_date: new Date().toISOString(),
            trading_capital: tradingCapital
          }
        ]);
        
        if (error) {
          console.error("Error saving submission to Supabase:", JSON.stringify(error));
        } else {
          console.log("Submission saved successfully to Supabase");
        }
      } catch (dbError) {
        console.error("Error saving submission:", dbError);
        // Continue execution despite database error
      }
    } else {
      console.log("No email provided, skipping database save");
    }
    
    // Return the qualification status and redirect URL
    return new Response(
      JSON.stringify({ 
        success: true, 
        qualifiesForCall,
        redirectUrl
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
        error: error.message || "Unknown error",
        redirectUrl: "/book-call" // Default redirect on error for better UX
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

// Helper function to check for minimum capital with better pattern matching
function checkMinimumCapital(capitalValue: string): boolean {
  if (!capitalValue) return false;
  
  // Convert to lowercase for case-insensitive matching
  const capital = capitalValue.toLowerCase();
  
  // All the different ways we might get the minimum capital threshold
  const minimumCapitalThresholds = [
    "$5,000", "$5k", "5000", "5k", 
    "$10,000", "$10k", "10000", "10k",
    "$25,000", "$25k", "25000", "25k",
    "$250,000", "$250k", "250000", "250k",
    "$5,000 – $10,000", "$5k – $10k", "$5k-$10k",
    "$10,000 – $25,000", "$10k – $25k", "$10k-$25k",
    "$10,000 – $250,000", "$10k – $250k", "$10k-$250k", 
    "over $5,000", "over $5k", "> $5k",
    "over $10,000", "over $10k", "> $10k",
    "over $25,000", "over $25k", "> $25k",
    "over $250,000", "over $250k", "> $250k"
  ];
  
  // Check if the capital value includes any of the threshold strings
  const matches = minimumCapitalThresholds.some(threshold => 
    capital.includes(threshold.toLowerCase())
  );
  
  console.log(`Capital value: "${capital}", Matches minimum threshold: ${matches}`);
  
  return matches;
}

serve(handler);
