import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, corsHeaders, unauthorizedResponse, badRequestResponse, internalErrorResponse, serviceUnavailableResponse } from "../_shared/auth.ts";
import { validateChatMessages } from "../_shared/validation.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authenticate request
    const auth = await authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse("Authentication required to use chat");
    }

    const body = await req.json();
    
    // Validate input
    const validation = validateChatMessages(body.messages);
    if (!validation.success) {
      return badRequestResponse(validation.error || "Invalid messages");
    }
    
    const messages = validation.data!;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return serviceUnavailableResponse("CHAT");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are India Assist Travel Buddy 🇮🇳, an expert AI travel guide specializing in India tourism. 

GREETING: Always start your first response with "Namaste 🙏" to welcome users warmly.

EMOJI USAGE: Use 2-3 friendly emojis per response to make conversations engaging and cheerful (like 🎉, 🌟, ✨, 🏰, 🍛, 🚂, etc.). Don't overuse them.

You provide detailed, accurate, and friendly travel advice about:
- Destinations and tourist attractions across India
- Food recommendations with specific restaurant names, cuisines, and price ranges
- Hotel suggestions with budgets and locations
- Cultural insights and traditions
- Safety tips for foreign tourists
- Transportation options (flights, trains, buses, local transport)
- Best times to visit different regions
- Local customs and etiquette
- Shopping recommendations
- Emergency contacts and health tips
- Visa and entry requirements
- Currency and payment methods

Always be warm, helpful, cheerful, and provide specific actionable information. Include prices in INR when relevant and mention exact names of places. Make travelers excited about exploring India!` 
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Service is busy. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return internalErrorResponse(new Error(`Gateway error: ${response.status}`), "CHAT");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    return internalErrorResponse(e, "CHAT");
  }
});
