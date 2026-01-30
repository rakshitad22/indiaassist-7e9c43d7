import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, corsHeaders, unauthorizedResponse, badRequestResponse, internalErrorResponse, serviceUnavailableResponse } from "../_shared/auth.ts";
import { validateTranslateRequest } from "../_shared/validation.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate request
    const auth = await authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse("Authentication required for translation");
    }

    const body = await req.json();
    
    // Validate input
    const validation = validateTranslateRequest(body);
    if (!validation.success) {
      return badRequestResponse(validation.error || "Invalid request");
    }
    
    const { text, targetLanguage } = validation.data!;

    const languageNames: Record<string, string> = {
      'en': 'English',
      'hi': 'Hindi',
      'bn': 'Bengali',
      'te': 'Telugu',
      'mr': 'Marathi',
      'ta': 'Tamil',
      'gu': 'Gujarati',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'pa': 'Punjabi',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'ja': 'Japanese',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'ru': 'Russian',
      'pt': 'Portuguese',
      'it': 'Italian',
      'ko': 'Korean',
      'th': 'Thai',
      'vi': 'Vietnamese',
      'id': 'Indonesian',
      'ms': 'Malay',
      'tr': 'Turkish',
      'nl': 'Dutch',
      'pl': 'Polish',
      'uk': 'Ukrainian',
      'cs': 'Czech',
      'sv': 'Swedish',
      'da': 'Danish',
      'fi': 'Finnish',
      'no': 'Norwegian',
      'el': 'Greek',
      'he': 'Hebrew',
      'hu': 'Hungarian',
      'ro': 'Romanian',
      'sk': 'Slovak',
      'hr': 'Croatian',
      'bg': 'Bulgarian',
      'sr': 'Serbian',
      'sl': 'Slovenian',
      'et': 'Estonian',
      'lv': 'Latvian',
      'lt': 'Lithuanian',
      'ne': 'Nepali',
      'si': 'Sinhala',
      'my': 'Myanmar (Burmese)',
      'km': 'Khmer',
      'lo': 'Lao',
      'sw': 'Swahili',
      'am': 'Amharic',
      'fa': 'Persian',
      'ur': 'Urdu',
      'af': 'Afrikaans',
      'zu': 'Zulu',
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return serviceUnavailableResponse("TRANSLATE");
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: `Translate the following text to ${languageNames[targetLanguage] || targetLanguage}. Only return the translated text, nothing else:\n\n${text}` }
        ],
      }),
    });

    if (!response.ok) {
      return internalErrorResponse(new Error(`Translation API error: ${response.status}`), "TRANSLATE");
    }

    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content || text;
    
    return new Response(
      JSON.stringify({ translation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return internalErrorResponse(error, "TRANSLATE");
  }
});
