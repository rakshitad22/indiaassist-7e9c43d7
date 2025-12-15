import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AMADEUS_API_KEY = Deno.env.get('AMADEUS_API_KEY');
const AMADEUS_API_SECRET = Deno.env.get('AMADEUS_API_SECRET');

// Cache for access token
let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  console.log('Getting new Amadeus access token...');
  
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
    const error = await response.text();
    console.error('Amadeus auth error:', error);
    throw new Error('Failed to authenticate with Amadeus API');
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // Refresh 60s before expiry
  
  return accessToken!;
}

// City to IATA code mapping for Indian cities
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
  'jodhpur': 'JDH',
  'srinagar': 'SXR',
  'leh': 'IXL',
  'ladakh': 'IXL',
  'shimla': 'SLV',
  'darjeeling': 'IXB',
  'mysore': 'MYQ',
  'coimbatore': 'CJB',
  'bhubaneswar': 'BBI',
  'patna': 'PAT',
  'ranchi': 'IXR',
  'nagpur': 'NAG',
  'indore': 'IDR',
  'chandigarh': 'IXC',
  'dehradun': 'DED',
  'rishikesh': 'DED',
  'haridwar': 'DED',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cityName, checkInDate, checkOutDate, adults, rooms } = await req.json();
    
    console.log('Search request:', { cityName, checkInDate, checkOutDate, adults, rooms });

    if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
      console.error('Amadeus API credentials not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Hotel booking API not configured',
          hotels: getMockHotels(cityName)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cityCode = cityToIataCode[cityName.toLowerCase()];
    if (!cityCode) {
      console.log('City not found, returning mock data');
      return new Response(
        JSON.stringify({ hotels: getMockHotels(cityName) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = await getAccessToken();

    // Search for hotels by city
    const hotelListResponse = await fetch(
      `https://api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=30&radiusUnit=KM&hotelSource=ALL`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!hotelListResponse.ok) {
      const error = await hotelListResponse.text();
      console.error('Hotel list error:', error);
      return new Response(
        JSON.stringify({ hotels: getMockHotels(cityName) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hotelListData = await hotelListResponse.json();
    const hotelIds = hotelListData.data?.slice(0, 20).map((h: any) => h.hotelId) || [];

    if (hotelIds.length === 0) {
      return new Response(
        JSON.stringify({ hotels: getMockHotels(cityName) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get hotel offers
    const offersResponse = await fetch(
      `https://api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${hotelIds.join(',')}&adults=${adults || 2}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&roomQuantity=${rooms || 1}&currency=INR`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!offersResponse.ok) {
      const error = await offersResponse.text();
      console.error('Hotel offers error:', error);
      return new Response(
        JSON.stringify({ hotels: getMockHotels(cityName) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const offersData = await offersResponse.json();
    
    const hotels = offersData.data?.map((offer: any) => ({
      id: offer.hotel.hotelId,
      name: offer.hotel.name,
      chainCode: offer.hotel.chainCode,
      rating: offer.hotel.rating || 4,
      address: offer.hotel.address?.lines?.join(', ') || cityName,
      price: parseFloat(offer.offers?.[0]?.price?.total || '0'),
      currency: offer.offers?.[0]?.price?.currency || 'INR',
      roomType: offer.offers?.[0]?.room?.type || 'Standard Room',
      description: offer.offers?.[0]?.room?.description?.text || 'Comfortable room with modern amenities',
      amenities: ['WiFi', 'AC', 'TV', 'Room Service'],
      available: offer.available,
      offerId: offer.offers?.[0]?.id,
      isRealBooking: true,
    })) || getMockHotels(cityName);

    return new Response(
      JSON.stringify({ hotels, source: 'amadeus' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Search hotels error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        hotels: getMockHotels('') 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getMockHotels(cityName: string) {
  const basePrices = [4500, 6000, 8500, 12000, 15000, 18000, 25000];
  const hotelNames = [
    'Taj Hotel',
    'ITC Grand',
    'The Oberoi',
    'Leela Palace',
    'Marriott',
    'Hyatt Regency',
    'Radisson Blu',
  ];

  return hotelNames.map((name, index) => ({
    id: `mock-${index}`,
    name: `${name} ${cityName}`,
    rating: Math.floor(Math.random() * 2) + 4,
    address: `${cityName}, India`,
    price: basePrices[index] + Math.floor(Math.random() * 2000),
    currency: 'INR',
    roomType: index < 3 ? 'Deluxe Room' : 'Standard Room',
    description: 'Experience luxury and comfort with world-class amenities',
    amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant'],
    available: true,
    isRealBooking: false,
  }));
}
