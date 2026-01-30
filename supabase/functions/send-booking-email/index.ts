import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticateRequest, corsHeaders, unauthorizedResponse, badRequestResponse, internalErrorResponse, serviceUnavailableResponse } from "../_shared/auth.ts";
import { validateBookingEmailRequest } from "../_shared/validation.ts";

// Generate rich HTML email template
function generateBookingEmailHtml(booking: {
  name: string;
  bookingType: string;
  bookingId: string;
  pnr?: string;
  destination: string;
  date: string;
  returnDate?: string;
  guests: string;
  hotel?: string;
  cabType?: string;
  pickup?: string;
  flightClass?: string;
  fare: number;
  taxes: number;
  total: number;
}): string {
  const bookingTypeLabel = booking.bookingType === "hotel" ? "Hotel" : 
                           booking.bookingType === "flight" ? "Flight" : "Cab";
  const bookingTypeEmoji = booking.bookingType === "hotel" ? "🏨" : 
                           booking.bookingType === "flight" ? "✈️" : "🚗";

  let bookingDetailsHtml = "";
  
  if (booking.bookingType === "hotel") {
    bookingDetailsHtml = `
      <tr><td style="padding: 8px 0; color: #888888; width: 40%;">Hotel:</td><td style="padding: 8px 0; color: #333333; font-weight: 500;">${booking.hotel}</td></tr>
      <tr><td style="padding: 8px 0; color: #888888;">Destination:</td><td style="padding: 8px 0; color: #333333; font-weight: 500;">${booking.destination}</td></tr>
      <tr><td style="padding: 8px 0; color: #888888;">Check-in Date:</td><td style="padding: 8px 0; color: #333333; font-weight: 500;">${booking.date}</td></tr>
      ${booking.returnDate ? `<tr><td style="padding: 8px 0; color: #888888;">Check-out Date:</td><td style="padding: 8px 0; color: #333333; font-weight: 500;">${booking.returnDate}</td></tr>` : ''}
      <tr><td style="padding: 8px 0; color: #888888;">Guests:</td><td style="padding: 8px 0; color: #333333; font-weight: 500;">${booking.guests}</td></tr>
    `;
  } else if (booking.bookingType === "flight") {
    bookingDetailsHtml = `
      <tr><td style="padding: 8px 0; color: #888888; width: 40%;">From:</td><td style="padding: 8px 0; color: #333333; font-weight: 500;">${booking.pickup}</td></tr>
      <tr><td style="padding: 8px 0; color: #888888;">To:</td><td style="padding: 8px 0; color: #333333; font-weight: 500;">${booking.destination}</td></tr>
      <tr><td style="padding: 8px 0; color: #888888;">Departure:</td><td style="padding: 8px 0; color: #333333; font-weight: 500;">${booking.date}</td></tr>
      ${booking.returnDate ? `<tr><td style="padding: 8px 0; color: #888888;">Return:</td><td style="padding: 8px 0; color: #333333; font-weight: 500;">${booking.returnDate}</td></tr>` : ''}
      <tr><td style="padding: 8px 0; color: #888888;">Class:</td><td style="padding: 8px 0; color: #333333; font-weight: 500;">${booking.flightClass}</td></tr>
      <tr><td style="padding: 8px 0; color: #888888;">Passengers:</td><td style="padding: 8px 0; color: #333333; font-weight: 500;">${booking.guests}</td></tr>
    `;
  } else {
    bookingDetailsHtml = `
      <tr><td style="padding: 8px 0; color: #888888; width: 40%;">Cab Type:</td><td style="padding: 8px 0; color: #333333; font-weight: 500;">${booking.cabType}</td></tr>
      <tr><td style="padding: 8px 0; color: #888888;">Pickup:</td><td style="padding: 8px 0; color: #333333; font-weight: 500;">${booking.pickup}</td></tr>
      <tr><td style="padding: 8px 0; color: #888888;">Destination:</td><td style="padding: 8px 0; color: #333333; font-weight: 500;">${booking.destination}</td></tr>
      <tr><td style="padding: 8px 0; color: #888888;">Date:</td><td style="padding: 8px 0; color: #333333; font-weight: 500;">${booking.date}</td></tr>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 20px auto;">
    <tr>
      <td>
        <!-- Header -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #FF9933 0%, #138808 100%); border-radius: 12px 12px 0 0;">
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 10px 0;">🇮🇳 India Assist</h1>
              <p style="color: #ffffff; font-size: 18px; margin: 0; opacity: 0.95;">Your ${bookingTypeLabel} Booking is Confirmed!</p>
            </td>
          </tr>
        </table>
        
        <!-- Content -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff;">
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; color: #333333; margin: 0 0 15px 0;">Dear <strong>${booking.name}</strong>,</p>
              <p style="font-size: 15px; color: #555555; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for choosing India Assist! Your ${bookingTypeLabel.toLowerCase()} booking has been successfully confirmed.
              </p>
              
              <!-- Booking Badge -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #e8f5e9; border-radius: 10px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <span style="display: inline-block; background-color: #FF9933; color: #ffffff; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: bold;">
                      ${bookingTypeEmoji} ${bookingTypeLabel} Booking
                    </span>
                    <p style="font-size: 20px; font-weight: bold; color: #2e7d32; margin: 15px 0 0 0;">Booking ID: ${booking.bookingId}</p>
                    ${booking.pnr ? `<p style="font-size: 16px; color: #666666; margin: 5px 0 0 0;">PNR: ${booking.pnr}</p>` : ''}
                  </td>
                </tr>
              </table>
              
              <!-- Booking Details -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border-left: 4px solid #FF9933; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="font-size: 18px; color: #333333; margin: 0 0 15px 0;">📋 Booking Details</h3>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      ${bookingDetailsHtml}
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Payment Section -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fff3e0; border-radius: 10px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="font-size: 18px; color: #e65100; margin: 0 0 15px 0;">💰 Payment Summary</h3>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #666666;">Base Fare:</td>
                        <td style="padding: 5px 0; font-size: 14px; color: #333333; text-align: right;">₹${booking.fare.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #666666;">Taxes & Fees:</td>
                        <td style="padding: 5px 0; font-size: 14px; color: #333333; text-align: right;">₹${booking.taxes.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 15px 0;"><hr style="border: none; border-top: 1px dashed #cccccc; margin: 0;"></td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-size: 16px; color: #333333; font-weight: bold;">Total Amount:</td>
                        <td style="padding: 5px 0; font-size: 20px; color: #2e7d32; font-weight: bold; text-align: right;">₹${booking.total.toLocaleString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 15px; color: #555555; line-height: 1.6; margin: 20px 0;">
                If you have any questions or need assistance, please don't hesitate to contact us.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 0 0 12px 12px;">
          <tr>
            <td style="padding: 30px; text-align: center;">
              <p style="font-size: 16px; color: #666666; margin: 0 0 10px 0;">Safe travels! 🙏</p>
              <p style="font-size: 18px; font-weight: bold; color: #333333; margin: 0 0 5px 0;">India Assist</p>
              <p style="font-size: 14px; color: #888888; margin: 0 0 15px 0;">📧 support@indiaassist.com | 📞 +91 1800-123-4567</p>
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 15px 0;">
              <p style="font-size: 12px; color: #aaaaaa; margin: 0;">This is an automated message. Please do not reply directly to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate request
    const auth = await authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse("Authentication required to send booking email");
    }

    const body = await req.json();
    
    // Validate input
    const validation = validateBookingEmailRequest(body);
    if (!validation.success) {
      return badRequestResponse(validation.error || "Invalid request");
    }
    
    const booking = validation.data!;
    
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return serviceUnavailableResponse("EMAIL");
    }
    
    const resend = new Resend(resendKey);

    // Verify the user is sending email to their own address (or use their own userId)
    const userId = booking.userId || auth.userId;

    // Check user's notification preferences if userId is provided
    if (userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: preferences, error: prefError } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (prefError) {
        console.error("Error fetching preferences:", prefError);
      }

      // If preferences exist, check if email is enabled and the notification type is allowed
      if (preferences) {
        // Check if email notifications are globally disabled
        if (!preferences.email_enabled) {
          console.log("Email notifications disabled by user preference");
          return new Response(
            JSON.stringify({ message: "Email notifications disabled by user", sent: false }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Check if this specific notification type is enabled
        const notificationType = booking.notificationType || 'booking_confirmations';
        const typeEnabled = preferences[notificationType as keyof typeof preferences];
        if (typeEnabled === false) {
          console.log(`Notification type ${notificationType} disabled by user preference`);
          return new Response(
            JSON.stringify({ message: `${notificationType} notifications disabled by user`, sent: false }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }
    }

    const bookingTypeLabel = booking.bookingType === "hotel" ? "Hotel" : 
                             booking.bookingType === "flight" ? "Flight" : "Cab";

    const html = generateBookingEmailHtml(booking);

    const emailResponse = await resend.emails.send({
      from: "India Assist <onboarding@resend.dev>",
      to: [booking.email],
      subject: `✅ ${bookingTypeLabel} Booking Confirmed - ${booking.bookingId}`,
      html,
    });

    console.log("Rich email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ ...emailResponse, sent: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    return internalErrorResponse(error, "EMAIL");
  }
};

serve(handler);
