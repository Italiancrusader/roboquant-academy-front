import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

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

// Initialize Resend for email notifications
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    
    // Send notification email to ventos99@gmail.com with submission details
    await sendNotificationEmail({
      userEmail: email,
      userName: fullName || `${firstName} ${lastName}`.trim(),
      userPhone: phone,
      tradingCapital,
      tradingExperience,
      tradingGoal,
      propFirmUsage,
      allAnswers: answers,
      submissionTime: new Date().toISOString()
    });
    
    // First, check for explicit non-qualifying ranges
    const nonQualifyingCapital = checkNonQualifyingCapital(tradingCapital);
    if (nonQualifyingCapital) {
      console.log(`Capital value "${tradingCapital}" explicitly non-qualifying`);
      const redirectUrl = "/checkout";
      
      // Still create a lead entry if we have valid contact info
      let leadId = null;
      if (email) {
        leadId = await createLeadEntry(email, firstName, lastName, phone, fullName, 'non-qualified', tradingCapital, tradingExperience, tradingGoal, propFirmUsage);
        
        // Start non-qualified email sequence
        await startEmailSequence(leadId, 'non-qualified', {
          tradingCapital,
          tradingExperience,
          tradingGoal,
          propFirmUsage
        });
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          qualifiesForCall: false,
          redirectUrl,
          leadId
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
    
    // If we have valid contact info, create a lead entry
    let leadId = null;
    if (email) {
      leadId = await createLeadEntry(
        email, 
        firstName, 
        lastName, 
        phone, 
        fullName, 
        qualifiesForCall ? 'qualified' : 'non-qualified',
        tradingCapital,
        tradingExperience,
        tradingGoal,
        propFirmUsage
      );
      
      // Start appropriate email sequence based on qualification
      await startEmailSequence(
        leadId, 
        qualifiesForCall ? 'qualified' : 'non-qualified', 
        {
          tradingCapital,
          tradingExperience,
          tradingGoal,
          propFirmUsage
        }
      );
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
        redirectUrl,
        leadId
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

// Helper function to send notification email
async function sendNotificationEmail(data: {
  userEmail: string;
  userName: string;
  userPhone: string;
  tradingCapital: string;
  tradingExperience: string;
  tradingGoal: string;
  propFirmUsage: string;
  allAnswers: any[];
  submissionTime: string;
}) {
  try {
    // Generate detailed answers section
    const answersHtml = data.allAnswers.map(answer => {
      const question = answer.field?.title || 'Unknown Question';
      let answerValue = '';
      
      if (answer.type === 'choice') {
        answerValue = answer.choice?.label || '';
      } else if (answer.type === 'text') {
        answerValue = answer.text || '';
      } else if (answer.type === 'number') {
        answerValue = answer.number?.toString() || '';
      } else if (answer.type === 'email') {
        answerValue = answer.email || '';
      } else if (answer.type === 'phone_number') {
        answerValue = answer.phone_number || '';
      }
      
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">${question}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${answerValue}</td>
        </tr>
      `;
    }).join('');

    const qualification = checkMinimumCapital(data.tradingCapital) ? 'QUALIFIED for strategy call' : 'NON-QUALIFIED (checkout flow)';
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New RoboQuant Academy Application</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0080FF 0%, #00E5FF 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">🤖 New RoboQuant Academy Application</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Qualification survey completed</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #0080FF; margin-top: 0;">Contact Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Name:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.userName || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.userEmail || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Phone:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.userPhone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Submission Time:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date(data.submissionTime).toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #0080FF; margin-top: 0;">Key Qualification Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Trading Capital:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.tradingCapital || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Trading Experience:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.tradingExperience || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Trading Goal:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.tradingGoal || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Prop Firm Usage:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.propFirmUsage || 'Not provided'}</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: ${checkMinimumCapital(data.tradingCapital) ? '#d4edda' : '#f8d7da'}; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid ${checkMinimumCapital(data.tradingCapital) ? '#c3e6cb' : '#f5c6cb'};">
          <h2 style="color: ${checkMinimumCapital(data.tradingCapital) ? '#155724' : '#721c24'}; margin-top: 0;">Qualification Status</h2>
          <p style="font-size: 18px; font-weight: bold; margin: 0; color: ${checkMinimumCapital(data.tradingCapital) ? '#155724' : '#721c24'};">${qualification}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #0080FF; margin-top: 0;">All Survey Responses</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${answersHtml}
          </table>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background-color: #e9ecef; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #6c757d; font-size: 14px;">
            This notification was automatically generated by the RoboQuant Academy Typeform integration.
          </p>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "RoboQuant Academy <team@roboquant.ai>",
      to: ["ventos99@gmail.com"],
      subject: `🤖 New Application: ${data.userName} (${qualification})`,
      html: emailHtml,
    });

    console.log("Notification email sent successfully:", emailResponse);
  } catch (error) {
    console.error("Error sending notification email:", error);
    // Don't throw error as this shouldn't break the main flow
  }
}

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

// Helper function to create a lead entry and return the lead ID
async function createLeadEntry(
  email: string, 
  firstName: string, 
  lastName: string, 
  phone: string, 
  fullName: string,
  qualificationStatus: string,
  tradingCapital: string,
  tradingExperience: string,
  tradingGoal: string,
  propFirmUsage: string
): Promise<string | null> {
  try {
    // Create a name from the available parts
    const name = fullName || `${firstName} ${lastName}`.trim();
    
    if (!name || !email) {
      console.log("Missing required name or email for lead creation");
      return null;
    }
    
    const leadData = {
      name: name,
      email: email,
      phone: phone || "",
      source: "typeform_quiz",
      lead_magnet: "qualification_survey",
      metadata: {
        qualification_status: qualificationStatus,
        trading_capital: tradingCapital,
        trading_experience: tradingExperience,
        trading_goal: tradingGoal,
        prop_firm_usage: propFirmUsage,
        first_name: firstName,
        last_name: lastName
      }
    };
    
    console.log("Creating lead entry:", leadData);
    
    // Use the insert_lead_service RPC for lead creation
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
      return null;
    } else {
      console.log("Lead entry created successfully:", leadResult);
      return leadResult;
    }
    
  } catch (error) {
    console.error("Error in lead creation:", error);
    return null;
  }
}

// Helper function to start an email sequence for a lead
async function startEmailSequence(leadId: string, qualification: string, additionalData: any): Promise<void> {
  if (!leadId) {
    console.log("No lead ID provided, skipping email sequence");
    return;
  }
  
  try {
    // Call the email-sequences function to start the sequence
    const response = await fetch(`${supabaseUrl}/functions/v1/email-sequences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        leadId,
        qualification,
        additionalData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to start email sequence: ${errorData.error || response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`Email sequence started successfully: ${result.message}`);
    
  } catch (error) {
    console.error(`Error starting email sequence for lead ${leadId}:`, error);
    // Continue execution despite sequence error
  }
}

serve(handler);
