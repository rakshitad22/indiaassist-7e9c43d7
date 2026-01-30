import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export interface AuthResult {
  userId: string;
  email: string;
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Authenticates a request using the Authorization header
 * Returns user info if authenticated, null otherwise
 */
export async function authenticateRequest(req: Request): Promise<AuthResult | null> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return null;
    }

    return {
      userId: data.user.id,
      email: data.user.email || "",
    };
  } catch {
    return null;
  }
}

/**
 * Creates an unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized"): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Creates a bad request response
 */
export function badRequestResponse(message: string): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Creates a generic internal server error response without leaking details
 * Logs the actual error server-side for debugging
 */
export function internalErrorResponse(error: unknown, context: string): Response {
  // Log full error details server-side only
  const errorId = crypto.randomUUID().slice(0, 8);
  console.error(`[${context}] Error ID: ${errorId}`, error instanceof Error ? error.message : String(error));
  
  return new Response(
    JSON.stringify({ 
      error: "An error occurred while processing your request. Please try again later.",
      errorId 
    }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Creates a service unavailable response for missing configuration
 */
export function serviceUnavailableResponse(context: string): Response {
  console.error(`[${context}] Service not configured`);
  return new Response(
    JSON.stringify({ error: "Service temporarily unavailable" }),
    { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
