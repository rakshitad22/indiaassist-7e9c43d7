import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AMADEUS_API_KEY = Deno.env.get('AMADEUS_API_KEY');
const AMADEUS_API_SECRET = Deno.env.get('AMADEUS_API_SECRET');

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch('https://api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: AMADEUS_API_KEY || '',
      client_secret: AMADEUS_API_SECRET || '',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Amadeus API');
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  
  return accessToken!;
}

const cityToIataCode: Record<string, string> = {
  'delhi': 'DEL',
  'mumbai': 'BOM',
  'bangalore': 'BLR',
  'bengaluru': 'BLR',
  'chennai': 'MAA',
  'kolkata': 'CCU',
  'hyderabad': 'HYD',
  'goa': 'GOI',
  'jaipur': 'JAI',
  'ahmedabad': 'AMD',
  'pune': 'PNQ',
  'kochi': 'COK',
  'cochin': 'COK',
  'trivandrum': 'TRV',
  'lucknow': 'LKO',
  'agra': 'AGR',
  'varanasi': 'VNS',
  'amritsar': 'ATQ',
  'udaipur': 'UDR',
  'new york': 'JFK',
  'london': 'LHR',
  'dubai': 'DXB',
  'singapore': 'SIN',
  'bangkok': 'BKK',
  'paris': 'CDG',
  'frankfurt': 'FRA',
  'hong kong': 'HKG',
  'tokyo': 'NRT',
  'sydney': 'SYD',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, departureDate, returnDate, adults, travelClass } = await req.json();
    
    console.log('Flight search:', { origin, destination, departureDate, returnDate, adults, travelClass });

    if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
      return new Response(
        JSON.stringify({ 
          error: 'Flight booking API not configured',
          flights: getMockFlights(origin, destination, departureDate)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const originCode = cityToIataCode[origin.toLowerCase()] || origin.toUpperCase();
    const destCode = cityToIataCode[destination.toLowerCase()] || destination.toUpperCase();

    const token = await getAccessToken();

    const searchParams = new URLSearchParams({
      originLocationCode: originCode,
      destinationLocationCode: destCode,
      departureDate: departureDate,
      adults: String(adults || 1),
      travelClass: travelClass || 'ECONOMY',
      currencyCode: 'INR',
      max: '10',
    });

    if (returnDate) {
      searchParams.append('returnDate', returnDate);
    }

    const flightResponse = await fetch(
      `https://api.amadeus.com/v2/shopping/flight-offers?${searchParams}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!flightResponse.ok) {
      const error = await flightResponse.text();
      console.error('Flight search error:', error);
      return new Response(
        JSON.stringify({ flights: getMockFlights(origin, destination, departureDate) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const flightData = await flightResponse.json();
    
    const flights = flightData.data?.map((offer: any) => {
      const outbound = offer.itineraries[0];
      const inbound = offer.itineraries[1];
      
      return {
        id: offer.id,
        price: parseFloat(offer.price.total),
        currency: offer.price.currency,
        airline: offer.validatingAirlineCodes?.[0] || 'Unknown',
        outbound: {
          departure: outbound.segments[0].departure.iataCode,
          arrival: outbound.segments[outbound.segments.length - 1].arrival.iataCode,
          departureTime: outbound.segments[0].departure.at,
          arrivalTime: outbound.segments[outbound.segments.length - 1].arrival.at,
          duration: outbound.duration,
          stops: outbound.segments.length - 1,
        },
        inbound: inbound ? {
          departure: inbound.segments[0].departure.iataCode,
          arrival: inbound.segments[inbound.segments.length - 1].arrival.iataCode,
          departureTime: inbound.segments[0].departure.at,
          arrivalTime: inbound.segments[inbound.segments.length - 1].arrival.at,
          duration: inbound.duration,
          stops: inbound.segments.length - 1,
        } : null,
        travelClass: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
        seatsAvailable: offer.numberOfBookableSeats || 5,
        isRealBooking: true,
      };
    }) || getMockFlights(origin, destination, departureDate);

    return new Response(
      JSON.stringify({ flights, source: 'amadeus' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Flight search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        flights: getMockFlights('', '', '') 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getMockFlights(origin: string, destination: string, date: string) {
  const airlines = ['Air India', 'IndiGo', 'SpiceJet', 'Vistara', 'GoAir'];
  const basePrices = [4500, 5200, 6800, 8500, 12000];
  
  return airlines.map((airline, index) => ({
    id: `mock-flight-${index}`,
    price: basePrices[index] + Math.floor(Math.random() * 2000),
    currency: 'INR',
    airline,
    outbound: {
      departure: origin || 'DEL',
      arrival: destination || 'BOM',
      departureTime: `${date}T${6 + index * 2}:00:00`,
      arrivalTime: `${date}T${8 + index * 2}:30:00`,
      duration: 'PT2H30M',
      stops: index % 2,
    },
    inbound: null,
    travelClass: 'ECONOMY',
    seatsAvailable: Math.floor(Math.random() * 10) + 1,
    isRealBooking: false,
  }));
}
