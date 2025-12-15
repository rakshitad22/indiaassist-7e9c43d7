import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RealHotel {
  id: string;
  name: string;
  rating: number;
  address: string;
  price: number;
  currency: string;
  roomType: string;
  description: string;
  amenities: string[];
  available: boolean;
  isRealBooking: boolean;
  offerId?: string;
}

export interface RealFlight {
  id: string;
  price: number;
  currency: string;
  airline: string;
  outbound: {
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    stops: number;
  };
  inbound: {
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    stops: number;
  } | null;
  travelClass: string;
  seatsAvailable: number;
  isRealBooking: boolean;
}

export const useRealBookings = () => {
  const [isSearchingHotels, setIsSearchingHotels] = useState(false);
  const [isSearchingFlights, setIsSearchingFlights] = useState(false);
  const [realHotels, setRealHotels] = useState<RealHotel[]>([]);
  const [realFlights, setRealFlights] = useState<RealFlight[]>([]);

  const searchRealHotels = async (
    cityName: string,
    checkInDate: string,
    checkOutDate: string,
    adults: number = 2,
    rooms: number = 1
  ) => {
    setIsSearchingHotels(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-hotels', {
        body: { cityName, checkInDate, checkOutDate, adults, rooms },
      });

      if (error) {
        console.error('Hotel search error:', error);
        toast.error('Failed to search hotels. Using demo data.');
        return [];
      }

      const hotels = data?.hotels || [];
      setRealHotels(hotels);
      
      if (data?.source === 'amadeus') {
        toast.success(`Found ${hotels.length} real hotels from Amadeus`);
      }
      
      return hotels;
    } catch (error) {
      console.error('Hotel search error:', error);
      toast.error('Failed to search hotels');
      return [];
    } finally {
      setIsSearchingHotels(false);
    }
  };

  const searchRealFlights = async (
    origin: string,
    destination: string,
    departureDate: string,
    returnDate?: string,
    adults: number = 1,
    travelClass: string = 'ECONOMY'
  ) => {
    setIsSearchingFlights(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-flights', {
        body: { origin, destination, departureDate, returnDate, adults, travelClass },
      });

      if (error) {
        console.error('Flight search error:', error);
        toast.error('Failed to search flights. Using demo data.');
        return [];
      }

      const flights = data?.flights || [];
      setRealFlights(flights);
      
      if (data?.source === 'amadeus') {
        toast.success(`Found ${flights.length} real flights from Amadeus`);
      }
      
      return flights;
    } catch (error) {
      console.error('Flight search error:', error);
      toast.error('Failed to search flights');
      return [];
    } finally {
      setIsSearchingFlights(false);
    }
  };

  const formatDuration = (duration: string) => {
    // Convert ISO 8601 duration to readable format
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return duration;
    
    const hours = match[1] ? match[1].replace('H', 'h ') : '';
    const minutes = match[2] ? match[2].replace('M', 'm') : '';
    return `${hours}${minutes}`.trim() || duration;
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return {
    isSearchingHotels,
    isSearchingFlights,
    realHotels,
    realFlights,
    searchRealHotels,
    searchRealFlights,
    formatDuration,
    formatDateTime,
  };
};
