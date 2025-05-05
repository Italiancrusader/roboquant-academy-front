
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const databaseUrl = Deno.env.get('SUPABASE_DB_URL');

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EnrollmentEvent {
  user_id: string;
  course_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, course_id }: EnrollmentEvent = await req.json();

    // Connect to database to get user and course details
    const pool = new postgres.Pool(databaseUrl!, 3);
    const connection = await pool.connect();
    
    try {
      // Get user details
      const userResult = await connection.queryObject`
        SELECT au.email, p.first_name, p.last_name
        FROM auth.users au
        JOIN public.profiles p ON au.id = p.id
        WHERE au.id = ${user_id}
      `;
      
      // Get course details
      const courseResult = await connection.queryObject`
        SELECT title, description
        FROM public.courses
        WHERE id = ${course_id}
      `;
      
      const user = userResult.rows[0];
      const course = courseResult.rows[0];
      
      if (!user || !course) {
        throw new Error("User or course not found");
      }
      
      const firstName = user.first_name || 'Student';
      
      // Send welcome email to enrolled student with your verified domain
      const emailResponse = await resend.emails.send({
        from: "Roboquant <team@updates.roboquant.ai>",
        to: [user.email],
        subject: `Welcome to ${course.title} - RoboQuant Academy`,
        html: `
          <h1>Welcome to ${course.title}!</h1>
          <p>Hello ${firstName},</p>
          <p>Thank you for enrolling in "${course.title}". We're excited to have you join us on this learning journey!</p>
          <p>Course description:</p>
          <blockquote style="background-color: #f7f7f7; padding: 15px; border-left: 4px solid #3b82f6;">
            ${course.description}
          </blockquote>
          <p><a href="${supabaseUrl}/courses/${course_id}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Learning Now</a></p>
          <p>If you have any questions or need assistance, feel free to contact our support team.</p>
          <p>Happy learning!<br>The RoboQuant Academy Team</p>
        `,
      });

      console.log("Enrollment email sent successfully:", emailResponse);
    } finally {
      connection.release();
      await pool.end();
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in enrollment-notification function:", error);
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
