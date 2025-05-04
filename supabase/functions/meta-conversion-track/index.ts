
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const META_CONVERSION_API_TOKEN = Deno.env.get("META_CONVERSION_API_TOKEN") || "";
const META_PIXEL_ID = Deno.env.get("META_PIXEL_ID") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!META_CONVERSION_API_TOKEN || !META_PIXEL_ID) {
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
    const { eventName, userData, customData, eventTime } = await req.json();

    if (!eventName) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing eventName parameter" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create the event data object for the Meta API
    const eventData = {
      event_name: eventName,
      event_time: eventTime || Math.floor(Date.now() / 1000),
      action_source: "website",
      user_data: userData || {},
      custom_data: customData || {},
    };

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
