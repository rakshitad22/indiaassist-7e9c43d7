import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  amount: number;
  currency?: string;
  bookingType: "hotel" | "flight" | "cab";
  bookingDetails: {
    name: string;
    email: string;
    destination: string;
    date: string;
    hotelName?: string;
    origin?: string;
    returnDate?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency = "inr", bookingType, bookingDetails }: PaymentRequest = await req.json();

    if (!amount || amount <= 0) {
      throw new Error("Invalid payment amount");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
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
      },
    });

    console.log("Payment session created:", session.id);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error creating payment session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
