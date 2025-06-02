
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const META_PIXEL_ID = "1570199587006306";
const META_API_VERSION = "v18.0";

interface MetaEventData {
  event_name: string;
  event_time: number;
  action_source: "website";
  event_source_url: string;
  user_data: {
    em?: string[];
    ph?: string[];
    fn?: string[];
    ln?: string[];
    ct?: string[];
    st?: string[];
    zp?: string[];
    country?: string[];
    external_id?: string[];
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  };
  custom_data?: {
    currency?: string;
    value?: string;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    contents?: Array<{id: string, quantity: number}>;
    num_items?: number;
  };
  event_id?: string;
}

interface ConversionsAPIRequest {
  eventName: string;
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    externalId?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    fbc?: string;
    fbp?: string;
  };
  customData?: {
    currency?: string;
    value?: number;
    contentName?: string;
    contentCategory?: string;
    contentIds?: string[];
    contents?: Array<{id: string, quantity: number}>;
    numItems?: number;
  };
  eventSourceUrl?: string;
  eventId?: string;
}

// Hash function for PII data
async function hashData(data: string): Promise<string> {
  if (!data) return "";
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("META_CONVERSIONS_API_TOKEN");
    
    if (!accessToken) {
      throw new Error("Meta Conversions API token not configured");
    }

    const requestData: ConversionsAPIRequest = await req.json();
    console.log(`📊 Sending Meta Conversions API event: ${requestData.eventName}`);

    // Prepare user data with hashing for PII
    const userData: any = {};
    
    if (requestData.userData.email) {
      userData.em = [await hashData(requestData.userData.email)];
    }
    if (requestData.userData.phone) {
      userData.ph = [await hashData(requestData.userData.phone)];
    }
    if (requestData.userData.firstName) {
      userData.fn = [await hashData(requestData.userData.firstName)];
    }
    if (requestData.userData.lastName) {
      userData.ln = [await hashData(requestData.userData.lastName)];
    }
    if (requestData.userData.city) {
      userData.ct = [await hashData(requestData.userData.city)];
    }
    if (requestData.userData.state) {
      userData.st = [await hashData(requestData.userData.state)];
    }
    if (requestData.userData.zipCode) {
      userData.zp = [await hashData(requestData.userData.zipCode)];
    }
    if (requestData.userData.country) {
      userData.country = [await hashData(requestData.userData.country)];
    }
    if (requestData.userData.externalId) {
      userData.external_id = [requestData.userData.externalId];
    }
    
    // Add non-PII data without hashing
    if (requestData.userData.clientIpAddress) {
      userData.client_ip_address = requestData.userData.clientIpAddress;
    }
    if (requestData.userData.clientUserAgent) {
      userData.client_user_agent = requestData.userData.clientUserAgent;
    }
    if (requestData.userData.fbc) {
      userData.fbc = requestData.userData.fbc;
    }
    if (requestData.userData.fbp) {
      userData.fbp = requestData.userData.fbp;
    }

    // Prepare event data
    const eventData: MetaEventData = {
      event_name: requestData.eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      event_source_url: requestData.eventSourceUrl || "https://roboquant.ai",
      user_data: userData,
    };

    // Add custom data if provided
    if (requestData.customData) {
      eventData.custom_data = {};
      
      if (requestData.customData.currency) {
        eventData.custom_data.currency = requestData.customData.currency;
      }
      if (requestData.customData.value) {
        eventData.custom_data.value = requestData.customData.value.toString();
      }
      if (requestData.customData.contentName) {
        eventData.custom_data.content_name = requestData.customData.contentName;
      }
      if (requestData.customData.contentCategory) {
        eventData.custom_data.content_category = requestData.customData.contentCategory;
      }
      if (requestData.customData.contentIds) {
        eventData.custom_data.content_ids = requestData.customData.contentIds;
      }
      if (requestData.customData.contents) {
        eventData.custom_data.contents = requestData.customData.contents;
      }
      if (requestData.customData.numItems) {
        eventData.custom_data.num_items = requestData.customData.numItems;
      }
    }

    // Add event ID for deduplication if provided
    if (requestData.eventId) {
      eventData.event_id = requestData.eventId;
    }

    // Send to Meta Conversions API
    const metaApiUrl = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events`;
    
    const response = await fetch(metaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        data: [eventData],
        test_event_code: Deno.env.get("META_TEST_EVENT_CODE") || undefined,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Meta Conversions API error:', result);
      throw new Error(`Meta API error: ${JSON.stringify(result)}`);
    }

    console.log('✅ Meta Conversions API event sent successfully:', result);

    return new Response(JSON.stringify({ 
      success: true,
      result,
      eventsSent: 1,
      message: `${requestData.eventName} event sent successfully`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Error in Meta Conversions API function:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
