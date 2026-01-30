import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { authenticateRequest, corsHeaders, unauthorizedResponse, badRequestResponse, internalErrorResponse, serviceUnavailableResponse } from "../_shared/auth.ts";
import { validatePaymentRequest } from "../_shared/validation.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate request
    const auth = await authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse("Authentication required to create payment");
    }

    const body = await req.json();
    
    // Validate input
    const validation = validatePaymentRequest(body);
    if (!validation.success) {
      return badRequestResponse(validation.error || "Invalid request");
    }
    
    const { amount, currency, bookingType, bookingDetails } = validation.data!;

    // Verify the email matches the authenticated user to prevent payment fraud
    if (bookingDetails.email.toLowerCase() !== auth.email.toLowerCase()) {
      console.warn("Email mismatch:", { provided: bookingDetails.email, authenticated: auth.email });
      // Allow it but log for audit purposes - in production, you might want to enforce this
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return serviceUnavailableResponse("PAYMENT");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: bookingDetails.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create a description based on booking type
    let description = "";
    if (bookingType === "hotel") {
      description = `Hotel Booking: ${bookingDetails.hotelName || "Hotel"} in ${bookingDetails.destination} on ${bookingDetails.date}`;
    } else if (bookingType === "flight") {
      description = `Flight Booking: ${bookingDetails.origin} to ${bookingDetails.destination} on ${bookingDetails.date}`;
    } else {
      description = `Cab Booking: ${bookingDetails.destination} on ${bookingDetails.date}`;
    }

    // Create checkout session with dynamic pricing
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : bookingDetails.email,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} Booking`,
              description: description,
            },
            unit_amount: Math.round(amount * 100), // Convert to smallest currency unit
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/bookings?payment=success`,
      cancel_url: `${req.headers.get("origin")}/bookings?payment=cancelled`,
      metadata: {
        bookingType,
        customerName: bookingDetails.name,
        destination: bookingDetails.destination,
        date: bookingDetails.date,
        hotelName: bookingDetails.hotelName || "",
        origin: bookingDetails.origin || "",
        userId: auth.userId, // Track the authenticated user
      },
    });

    console.log("Payment session created:", session.id, "for user:", auth.userId);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return internalErrorResponse(error, "PAYMENT");
  }
});
