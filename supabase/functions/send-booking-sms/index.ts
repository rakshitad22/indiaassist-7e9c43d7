import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingSmsRequest {
  phoneNumber: string;
  bookingType: "hotel" | "flight";
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
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, bookingType, bookingDetails }: BookingSmsRequest = await req.json();

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error("Twilio credentials not configured");
    }

    // Format the message based on booking type
    let message = "";
    if (bookingType === "hotel") {
      message = `🏨 Booking Confirmed!\n\nHotel: ${bookingDetails.hotelName || "Your Hotel"}\nDestination: ${bookingDetails.destination}\nCheck-in: ${bookingDetails.checkIn}\nCheck-out: ${bookingDetails.checkOut}\nPrice: ${bookingDetails.price}\n\nThank you for booking with TravelEase!`;
    } else {
      message = `✈️ Flight Booking Confirmed!\n\n${bookingDetails.airline ? `Airline: ${bookingDetails.airline}\n` : ""}Route: ${bookingDetails.origin} → ${bookingDetails.destination}\nDeparture: ${bookingDetails.departureDate}${bookingDetails.returnDate ? `\nReturn: ${bookingDetails.returnDate}` : ""}\nPrice: ${bookingDetails.price}\n\nThank you for booking with TravelEase!`;
    }

    // Send SMS via Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append("To", phoneNumber);
    formData.append("From", twilioPhoneNumber);
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
      console.error("Twilio API error:", result);
      throw new Error(result.message || "Failed to send SMS");
    }

    console.log("SMS sent successfully:", result.sid);

    return new Response(JSON.stringify({ success: true, messageSid: result.sid }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-sms function:", error);
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
