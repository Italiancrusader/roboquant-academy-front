
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const META_CONVERSION_API_TOKEN = Deno.env.get("META_CONVERSION_API_TOKEN") || "";
const META_PIXEL_ID = Deno.env.get("META_PIXEL_ID") || "";

// Simple hash function for privacy (Meta requires hashed user data)
function hashValue(value: string): string {
  if (!value) return "";
  // Note: In production, use a proper SHA-256 hashing
  return btoa(value).replace(/=/g, '');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Meta Conversion API Function triggered");
    
    if (!META_CONVERSION_API_TOKEN || !META_PIXEL_ID) {
      console.error("Missing Meta API credentials:", { 
        hasToken: !!META_CONVERSION_API_TOKEN, 
        hasPixelId: !!META_PIXEL_ID 
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Meta API credentials not configured" 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Parse the request body
    const { 
      eventName, 
      userData, 
      customData, 
      eventTime,
      eventSourceUrl,
      actionSource = "website" 
    } = await req.json();

    console.log(`Processing ${eventName} event`, { 
      hasUserData: !!userData,
      hasCustomData: !!customData,
      eventSourceUrl
    });

    if (!eventName) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing eventName parameter" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Process user data to match Meta's requirements
    const processedUserData: Record<string, any> = {};
    
    // Hash PII fields if they exist in userData
    if (userData) {
      if (userData.email) processedUserData.em = hashValue(userData.email.toLowerCase());
      if (userData.phone) processedUserData.ph = hashValue(userData.phone);
      if (userData.firstName) processedUserData.fn = hashValue(userData.firstName);
      if (userData.lastName) processedUserData.ln = hashValue(userData.lastName);
      if (userData.city) processedUserData.ct = hashValue(userData.city);
      if (userData.state) processedUserData.st = hashValue(userData.state);
      if (userData.zip) processedUserData.zp = hashValue(userData.zip);
      if (userData.country) processedUserData.country = hashValue(userData.country);
      if (userData.externalId) processedUserData.external_id = hashValue(userData.externalId);
      
      // Non-hashed fields
      processedUserData.client_user_agent = userData.clientUserAgent;
      processedUserData.client_ip_address = userData.clientIpAddress;
      processedUserData.fbc = userData.fbc;
      processedUserData.fbp = userData.fbp;
      processedUserData.subscription_id = userData.subscriptionId;
    }

    // Create the event data object for the Meta API
    const eventData = {
      event_name: eventName,
      event_time: eventTime || Math.floor(Date.now() / 1000),
      event_source_url: eventSourceUrl,
      action_source: actionSource,
      user_data: processedUserData,
      custom_data: customData || {},
    };

    console.log(`Sending event ${eventName} to Meta Conversion API`);
    console.log("Event data:", JSON.stringify(eventData));

    // Send the event to Meta Conversion API
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${META_PIXEL_ID}/events?access_token=${META_CONVERSION_API_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [eventData],
          test_event_code: "TEST12345", // Use this for testing, remove in production
        }),
      }
    );

    const result = await response.json();

    console.log(`Meta Conversion API response for event "${eventName}":`, result);

    return new Response(
      JSON.stringify({ success: true, result }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in Meta Conversion API:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
