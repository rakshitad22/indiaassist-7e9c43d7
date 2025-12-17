import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  email: string;
  name: string;
  bookingType: "hotel" | "cab" | "flight";
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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking: BookingEmailRequest = await req.json();
    console.log("Sending booking confirmation email to:", booking.email);

    const bookingTypeLabel = booking.bookingType === "hotel" ? "Hotel" : 
                             booking.bookingType === "flight" ? "Flight" : "Cab";

    const bookingDetails = booking.bookingType === "hotel" 
      ? `<p><strong>Hotel:</strong> ${booking.hotel}</p>
         <p><strong>Destination:</strong> ${booking.destination}</p>
         <p><strong>Check-in Date:</strong> ${booking.date}</p>
         <p><strong>Guests:</strong> ${booking.guests}</p>`
      : booking.bookingType === "flight"
      ? `<p><strong>PNR:</strong> ${booking.pnr}</p>
         <p><strong>From:</strong> ${booking.pickup}</p>
         <p><strong>To:</strong> ${booking.destination}</p>
         <p><strong>Departure:</strong> ${booking.date}</p>
         ${booking.returnDate ? `<p><strong>Return:</strong> ${booking.returnDate}</p>` : ''}
         <p><strong>Class:</strong> ${booking.flightClass}</p>
         <p><strong>Passengers:</strong> ${booking.guests}</p>`
      : `<p><strong>Cab Type:</strong> ${booking.cabType}</p>
         <p><strong>Pickup:</strong> ${booking.pickup}</p>
         <p><strong>Destination:</strong> ${booking.destination}</p>
         <p><strong>Date:</strong> ${booking.date}</p>`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF9933, #138808); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-id { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .booking-id h2 { margin: 0; color: #2e7d32; font-size: 18px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF9933; }
          .details p { margin: 8px 0; }
          .payment { background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .payment h3 { margin-top: 0; color: #e65100; }
          .total { font-size: 24px; color: #2e7d32; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .badge { display: inline-block; background: #FF9933; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🇮🇳 India Assist</h1>
            <p>Your ${bookingTypeLabel} Booking is Confirmed!</p>
          </div>
          <div class="content">
            <p>Dear <strong>${booking.name}</strong>,</p>
            <p>Thank you for choosing India Assist! Your ${bookingTypeLabel.toLowerCase()} booking has been successfully confirmed.</p>
            
            <div class="booking-id">
              <span class="badge">${bookingTypeLabel} Booking</span>
              <h2>Booking ID: ${booking.bookingId}</h2>
            </div>
            
            <div class="details">
              <h3>📋 Booking Details</h3>
              ${bookingDetails}
            </div>
            
            <div class="payment">
              <h3>💰 Payment Summary</h3>
              <p><strong>Base Fare:</strong> ₹${booking.fare.toLocaleString()}</p>
              <p><strong>Taxes & Fees:</strong> ₹${booking.taxes.toLocaleString()}</p>
              <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;">
              <p class="total">Total Amount: ₹${booking.total.toLocaleString()}</p>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
            
            <div class="footer">
              <p>Safe travels! 🙏</p>
              <p><strong>India Assist</strong></p>
              <p>📧 support@indiaassist.com | 📞 +91 1800-123-4567</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "India Assist <onboarding@resend.dev>",
      to: [booking.email],
      subject: `✅ ${bookingTypeLabel} Booking Confirmed - ${booking.bookingId}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
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
