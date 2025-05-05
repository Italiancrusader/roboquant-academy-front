
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type LeadMagnetRequest = {
  name: string;
  email: string;
  leadMagnet: string;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Processing lead magnet request");
    const { name, email, leadMagnet } = await req.json() as LeadMagnetRequest;
    
    // Validate inputs
    if (!name || !email || !leadMagnet) {
      console.error("Missing required fields:", { name, email, leadMagnet });
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Resend client
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error("Resend API key not found");
      return new Response(
        JSON.stringify({ error: 'Resend API key not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Configure attachment based on leadMagnet type
    let attachmentUrl = '';
    let attachmentName = '';
    
    if (leadMagnet === 'free_mt5_bot_source_code') {
      // Using a public URL that will be accessible to Resend
      attachmentUrl = 'https://roboquant.ai/resources/RoboQuant_Free_Bot.mq5'; // Replace with actual hosted file URL
      attachmentName = 'RoboQuant_Free_Bot.mq5';
    }

    console.log("Sending email to:", email, "with attachment:", attachmentUrl);

    // Send email with attachment via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'RoboQuant <noreply@roboquantacademy.com>',
        to: email,
        subject: `Your Free MT5 Bot Source Code from RoboQuant`,
        text: `Hello ${name},\n\nThank you for your interest in RoboQuant Academy! As promised, I've attached your free MT5 bot source code.\n\nIf you have any questions or need assistance implementing this bot, feel free to reply to this email or join our community.\n\nHappy Trading,\nTim from RoboQuant Academy`,
        attachments: [
          {
            filename: attachmentName,
            path: attachmentUrl
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    console.log("Email sent successfully to:", email);
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in send-lead-magnet function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
