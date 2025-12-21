import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingWhatsAppRequest {
  phoneNumber: string;
  bookingType: "hotel" | "flight" | "cab";
  bookingDetails: {
    name?: string;
    destination?: string;
    origin?: string;
    checkIn?: string;
    checkOut?: string;
    departureDate?: string;
    returnDate?: string;
    price?: string;
    hotelName?: string;
    airline?: string;
    bookingId?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, bookingType, bookingDetails }: BookingWhatsAppRequest = await req.json();

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error("Twilio credentials not configured");
    }

    // Format the WhatsApp message based on booking type
    let message = "";
    if (bookingType === "hotel") {
      message = `🏨 *Booking Confirmed!*\n\n*Hotel:* ${bookingDetails.hotelName || "Your Hotel"}\n*Destination:* ${bookingDetails.destination}\n*Check-in:* ${bookingDetails.checkIn}\n*Check-out:* ${bookingDetails.checkOut}\n*Total:* ${bookingDetails.price}\n*Booking ID:* ${bookingDetails.bookingId}\n\nThank you for booking with TravelEase! 🎉`;
    } else if (bookingType === "flight") {
      message = `✈️ *Flight Booking Confirmed!*\n\n${bookingDetails.airline ? `*Airline:* ${bookingDetails.airline}\n` : ""}*Route:* ${bookingDetails.origin} → ${bookingDetails.destination}\n*Departure:* ${bookingDetails.departureDate}${bookingDetails.returnDate ? `\n*Return:* ${bookingDetails.returnDate}` : ""}\n*Total:* ${bookingDetails.price}\n*Booking ID:* ${bookingDetails.bookingId}\n\nThank you for booking with TravelEase! 🎉`;
    } else {
      message = `🚗 *Cab Booking Confirmed!*\n\n*Pickup:* ${bookingDetails.origin}\n*Destination:* ${bookingDetails.destination}\n*Date:* ${bookingDetails.departureDate}\n*Total:* ${bookingDetails.price}\n*Booking ID:* ${bookingDetails.bookingId}\n\nThank you for booking with TravelEase! 🎉`;
    }

    // Format phone number for WhatsApp (needs to include country code without +)
    let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    if (!formattedPhone.startsWith('91')) {
      formattedPhone = '91' + formattedPhone;
    }

    // Send WhatsApp message via Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append("To", `whatsapp:+${formattedPhone}`);
    formData.append("From", `whatsapp:${twilioPhoneNumber}`);
    formData.append("Body", message);

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Twilio WhatsApp API error:", result);
      throw new Error(result.message || "Failed to send WhatsApp message");
    }

    console.log("WhatsApp message sent successfully:", result.sid);

    return new Response(JSON.stringify({ success: true, messageSid: result.sid }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-whatsapp function:", error);
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
