
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
          redirectUrl: "/checkout" // Default to checkout on error for better UX
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
    
    // Extract user info from hidden fields or query for Typeform data about the respondent
    let email = hiddenFields.email || "";
    let firstName = hiddenFields.firstName || "";
    let lastName = hiddenFields.lastName || "";
    let phone = hiddenFields.phone || "";
    let fullName = hiddenFields.name || "";
    
    // If we have a full name but not first/last name, try to split it
    if (fullName && (!firstName || !lastName)) {
      const nameParts = fullName.trim().split(' ');
      if (nameParts.length > 0) {
        firstName = firstName || nameParts[0] || '';
        lastName = lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
      }
    }
    
    // Try to extract contact information from form answers
    answers.forEach((answer: any) => {
      const fieldRef = answer.field?.ref || '';
      
      // Check for email fields by common identifiers or text patterns
      if (answer.type === 'email') {
        email = email || answer.email || '';
      }
      else if (answer.type === 'text') {
        const textValue = answer.text || '';
        
        // Check for name fields by common identifiers
        if (fieldRef.includes('name') || answer.field?.title?.toLowerCase().includes('name')) {
          if (!fullName) {
            fullName = textValue;
            // If we don't have first/last name yet, try to parse it
            if (!firstName || !lastName) {
              const nameParts = textValue.trim().split(' ');
              if (nameParts.length > 0) {
                firstName = firstName || nameParts[0] || '';
                lastName = lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
              }
            }
          }
        }
        
        // Check for email fields by common identifiers or text patterns
        else if ((fieldRef.includes('email') || 
            answer.field?.title?.toLowerCase().includes('email')) && 
            textValue.includes('@')) {
          email = email || textValue;
        }
        
        // Check for phone fields by common identifiers
        else if (fieldRef.includes('phone') || answer.field?.title?.toLowerCase().includes('phone')) {
          phone = phone || textValue;
        }
      }
      // Also try to extract phone from phone-typed questions
      else if (answer.type === 'phone_number') {
        phone = phone || answer.phone_number || '';
      }
    });
    
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
      } else if (answer.type === "email") {
        value = answer.email || "";
      } else if (answer.type === "phone_number") {
        value = answer.phone_number || "";
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
    
    // Log the extracted contact information
    console.log("Contact information extracted:", { email, firstName, lastName, phone, fullName });
    
    // First, check for explicit non-qualifying ranges
    const nonQualifyingCapital = checkNonQualifyingCapital(tradingCapital);
    if (nonQualifyingCapital) {
      console.log(`Capital value "${tradingCapital}" explicitly non-qualifying`);
      const redirectUrl = "/checkout";
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          qualifiesForCall: false,
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
    }
    
    // Then check for qualifying capital if not explicitly non-qualifying
    const hasMinimumCapital = checkMinimumCapital(tradingCapital);
    
    // Main qualification gate
    const qualifiesForCall = hasMinimumCapital;

    console.log("Qualification status:", qualifiesForCall);
    console.log("Has minimum capital:", hasMinimumCapital);
    
    // Determine redirect URL based on qualification
    const redirectUrl = qualifiesForCall ? "/book-call" : "/checkout";
    console.log("Redirect URL:", redirectUrl);
    
    // If we have valid contact info, also create a lead entry
    if (email) {
      try {
        // Create a lead entry with the contact information
        const leadData = {
          name: fullName || `${firstName} ${lastName}`.trim(),
          email: email,
          phone: phone || "",
          source: "typeform_quiz",
          lead_magnet: "qualification_survey",
          metadata: {
            qualification_status: qualifiesForCall ? "qualified" : "not_qualified",
            trading_capital: tradingCapital,
            trading_experience: tradingExperience,
            trading_goal: tradingGoal
          }
        };
        
        // Check if name and email are present before attempting to insert
        if (leadData.name && leadData.email) {
          console.log("Creating lead entry:", leadData);
          
          const { data: leadResult, error: leadError } = await supabase.rpc('insert_lead_service', {
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone,
            source: leadData.source,
            lead_magnet: leadData.lead_magnet,
            metadata: leadData.metadata
          });
          
          if (leadError) {
            console.error("Error creating lead entry:", leadError);
          } else {
            console.log("Lead entry created successfully:", leadResult);
          }
        } else {
          console.log("Skipping lead creation due to missing name or email");
        }
      } catch (leadError) {
        console.error("Error in lead creation:", leadError);
        // Continue execution despite lead creation error
      }
    }
    
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
        redirectUrl: "/checkout" // Default to checkout on error for better UX
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

// Helper function to explicitly check for non-qualifying capital ranges
function checkNonQualifyingCapital(capitalValue: string): boolean {
  if (!capitalValue) return false;
  
  // Convert to lowercase for case-insensitive matching
  const capital = capitalValue.toLowerCase();
  
  // Define explicitly non-qualifying capital ranges
  const nonQualifyingRanges = [
    "< $1k", 
    "$1k-$5k", 
    "$1k–$5k", 
    "$1,000-$5,000", 
    "$1,000–$5,000",
    "less than $1k",
    "less than $5k",
    "$0-$1k",
    "$0-$5k"
  ];
  
  // Check if capital matches any non-qualifying range exactly
  return nonQualifyingRanges.some(range => 
    capital === range.toLowerCase()
  );
}

// Helper function to check for minimum capital with better pattern matching
function checkMinimumCapital(capitalValue: string): boolean {
  if (!capitalValue) return false;
  
  // Convert to lowercase for case-insensitive matching
  const capital = capitalValue.toLowerCase();
  
  // Define minimum qualifying capital thresholds (5k and above)
  const qualifyingCapitalThresholds = [
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
  
  // Check if it matches a qualifying threshold
  const matches = qualifyingCapitalThresholds.some(threshold => 
    capital === threshold.toLowerCase()
  );
  
  console.log(`Capital value: "${capital}", Matches minimum threshold: ${matches}`);
  
  return matches;
}

serve(handler);
