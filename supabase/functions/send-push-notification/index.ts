import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticateRequest, corsHeaders, unauthorizedResponse, badRequestResponse, internalErrorResponse, serviceUnavailableResponse } from "../_shared/auth.ts";
import { validatePushRequest } from "../_shared/validation.ts";

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{ action: string; title: string }>;
}

// Web Push implementation using raw crypto
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    const audience = new URL(subscription.endpoint).origin;
    const subject = "mailto:support@indiaassist.com";
    
    // Create JWT for VAPID
    const header = { typ: "JWT", alg: "ES256" };
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      aud: audience,
      exp: now + 12 * 60 * 60, // 12 hours
      sub: subject,
    };

    const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const claimsB64 = btoa(JSON.stringify(claims)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const unsignedToken = `${headerB64}.${claimsB64}`;

    // Import private key and sign
    const privateKeyRaw = Uint8Array.from(atob(vapidPrivateKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      privateKeyRaw,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      cryptoKey,
      new TextEncoder().encode(unsignedToken)
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const jwt = `${unsignedToken}.${signatureB64}`;

    // Send push notification
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Encoding": "aes128gcm",
        "TTL": "86400",
        "Authorization": `vapid t=${jwt}, k=${vapidPublicKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Push failed:", response.status, text);
      return false;
    }

    console.log("Push notification sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validation = validatePushRequest(body);
    if (!validation.success) {
      return badRequestResponse(validation.error || "Invalid request");
    }
    
    const request = validation.data!;
    
    console.log("Push notification request:", request.action, "type:", request.notificationType);

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPublicKey || !vapidPrivateKey) {
      return serviceUnavailableResponse("PUSH");
    }

    // Return VAPID public key for client subscription - this is a public endpoint
    if (request.action === 'get-vapid-key') {
      return new Response(
        JSON.stringify({ vapidPublicKey }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // For sending notifications, require authentication
    if (request.action === 'send') {
      const auth = await authenticateRequest(req);
      if (!auth) {
        return unauthorizedResponse("Authentication required to send push notifications");
      }

      const userId = request.userId;
      const payload = request.payload;
      
      if (!userId || !payload) {
        return badRequestResponse("User ID and payload required for send action");
      }

      // Verify the user is sending to their own subscriptions
      if (userId !== auth.userId) {
        console.warn("User attempting to send push to different user:", { requesting: auth.userId, target: userId });
        return unauthorizedResponse("Cannot send push notifications to other users");
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Check user's notification preferences
      if (request.notificationType) {
        const { data: preferences, error: prefError } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (prefError) {
          console.error("Error fetching preferences:", prefError);
        }

        // If preferences exist, check if push is enabled and the notification type is allowed
        if (preferences) {
          // Check if push notifications are globally disabled
          if (!preferences.push_enabled) {
            console.log("Push notifications disabled by user preference");
            return new Response(
              JSON.stringify({ message: "Push notifications disabled by user", sent: 0 }),
              { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
          }

          // Check if this specific notification type is enabled
          const typeEnabled = preferences[request.notificationType as keyof typeof preferences];
          if (typeEnabled === false) {
            console.log(`Notification type ${request.notificationType} disabled by user preference`);
            return new Response(
              JSON.stringify({ message: `${request.notificationType} notifications disabled by user`, sent: 0 }),
              { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
          }
        }
      }

      // Get user's push subscriptions
      const { data: subscriptions, error } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching subscriptions:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch subscriptions" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log("No push subscriptions found for user");
        return new Response(
          JSON.stringify({ message: "No subscriptions found", sent: 0 }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Send to all user's devices
      let sentCount = 0;
      for (const sub of subscriptions) {
        const success = await sendWebPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload as PushPayload,
          vapidPublicKey,
          vapidPrivateKey
        );
        if (success) sentCount++;
      }

      console.log(`Sent ${sentCount}/${subscriptions.length} push notifications`);
      return new Response(
        JSON.stringify({ message: "Push notifications sent", sent: sentCount, total: subscriptions.length }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return badRequestResponse("Invalid action");

  } catch (error) {
    return internalErrorResponse(error, "PUSH");
  }
};

serve(handler);
