
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactRequest = await req.json();

    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: "RoboQuant Academy <no-reply@roboquantacademy.com>",
      to: ["admin@roboquantacademy.com"],
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h2>Message:</h2>
        <p>${message}</p>
      `,
    });

    // Send confirmation to user
    const userEmailResponse = await resend.emails.send({
      from: "RoboQuant Academy <no-reply@roboquantacademy.com>",
      to: [email],
      subject: "We received your message - RoboQuant Academy",
      html: `
        <h1>Thank you for contacting us!</h1>
        <p>Dear ${name},</p>
        <p>We have received your message regarding "${subject}". Our team will review it and get back to you as soon as possible.</p>
        <p>Below is a copy of your message:</p>
        <blockquote style="background-color: #f7f7f7; padding: 15px; border-left: 4px solid #3b82f6;">
          ${message}
        </blockquote>
        <p>Best regards,<br>The RoboQuant Academy Team</p>
      `,
    });

    console.log("Emails sent successfully:", { adminEmailResponse, userEmailResponse });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
