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
      return unauthorizedResponse("Authentication required to send SMS");
    }

    const body = await req.json();
    
    // Validate input
    const validation = validateSmsRequest(body);
    if (!validation.success) {
      return badRequestResponse(validation.error || "Invalid request");
    }
    
    const { phoneNumber, bookingType, bookingDetails } = validation.data!;

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return serviceUnavailableResponse("SMS");
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

    // Format the message based on booking type
    let message = "";
    if (bookingType === "hotel") {
      message = `🏨 Booking Confirmed!\n\nHotel: ${hotelName}\nDestination: ${destination}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nPrice: ${price}\n\nThank you for booking with TravelEase!`;
    } else {
      message = `✈️ Flight Booking Confirmed!\n\n${airline ? `Airline: ${airline}\n` : ""}Route: ${origin} → ${destination}\nDeparture: ${departureDate}${returnDate ? `\nReturn: ${returnDate}` : ""}\nPrice: ${price}\n\nThank you for booking with TravelEase!`;
    }

    console.log("Sending SMS for user:", auth.userId);

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
      return internalErrorResponse(new Error("SMS delivery failed"), "SMS");
    }

    console.log("SMS sent successfully:", result.sid);

    return new Response(JSON.stringify({ success: true, messageSid: result.sid }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    return internalErrorResponse(error, "SMS");
  }
};

serve(handler);
