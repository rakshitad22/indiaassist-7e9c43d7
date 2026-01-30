import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { authenticateRequest, corsHeaders, unauthorizedResponse, badRequestResponse, internalErrorResponse, serviceUnavailableResponse } from "../_shared/auth.ts";
import { validateSmsRequest, sanitizeString } from "../_shared/validation.ts";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate request
    const auth = await authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse("Authentication required to send WhatsApp message");
    }

    const body = await req.json();
    
    // Validate input - reuse SMS validation as structure is similar
    const validation = validateSmsRequest(body);
    if (!validation.success) {
      return badRequestResponse(validation.error || "Invalid request");
    }
    
    const { phoneNumber, bookingType, bookingDetails } = validation.data!;

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return serviceUnavailableResponse("WHATSAPP");
    }

    // Sanitize booking details for message
    const destination = sanitizeString(String(bookingDetails.destination || ""));
    const hotelName = sanitizeString(String(bookingDetails.hotelName || "Your Hotel"));
    const origin = sanitizeString(String(bookingDetails.origin || ""));
    const checkIn = sanitizeString(String(bookingDetails.checkIn || ""));
    const checkOut = sanitizeString(String(bookingDetails.checkOut || ""));
    const departureDate = sanitizeString(String(bookingDetails.departureDate || ""));
    const returnDate = sanitizeString(String(bookingDetails.returnDate || ""));
    const price = sanitizeString(String(bookingDetails.price || ""));
    const airline = sanitizeString(String(bookingDetails.airline || ""));
    const bookingId = sanitizeString(String(bookingDetails.bookingId || ""));

    // Format the WhatsApp message based on booking type
    let message = "";
    if (bookingType === "hotel") {
      message = `🏨 *Booking Confirmed!*\n\n*Hotel:* ${hotelName}\n*Destination:* ${destination}\n*Check-in:* ${checkIn}\n*Check-out:* ${checkOut}\n*Total:* ${price}\n*Booking ID:* ${bookingId}\n\nThank you for booking with TravelEase! 🎉`;
    } else if (bookingType === "flight") {
      message = `✈️ *Flight Booking Confirmed!*\n\n${airline ? `*Airline:* ${airline}\n` : ""}*Route:* ${origin} → ${destination}\n*Departure:* ${departureDate}${returnDate ? `\n*Return:* ${returnDate}` : ""}\n*Total:* ${price}\n*Booking ID:* ${bookingId}\n\nThank you for booking with TravelEase! 🎉`;
    } else {
      message = `🚗 *Cab Booking Confirmed!*\n\n*Pickup:* ${origin}\n*Destination:* ${destination}\n*Date:* ${departureDate}\n*Total:* ${price}\n*Booking ID:* ${bookingId}\n\nThank you for booking with TravelEase! 🎉`;
    }

    // Format phone number for WhatsApp (needs to include country code without +)
    let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    if (!formattedPhone.startsWith('91')) {
      formattedPhone = '91' + formattedPhone;
    }

    console.log("Sending WhatsApp message for user:", auth.userId);

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
      return internalErrorResponse(new Error("WhatsApp delivery failed"), "WHATSAPP");
    }

    console.log("WhatsApp message sent successfully:", result.sid);

    return new Response(JSON.stringify({ success: true, messageSid: result.sid }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    return internalErrorResponse(error, "WHATSAPP");
  }
};

serve(handler);
