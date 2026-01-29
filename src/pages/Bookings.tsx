import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Car, Hotel, Users, Plane, CheckCircle, Download, Printer, Wifi, Waves, Dumbbell, Sparkles, Utensils, Star, Image as ImageIcon, ChevronLeft, ChevronRight, Search, Loader2, Mail, Phone, MessageCircle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRealBookings, RealHotel, RealFlight } from "@/hooks/useRealBookings";
import { supabase } from "@/integrations/supabase/client";

interface Booking {
  id: string;
  type: "hotel" | "cab" | "flight";
  name: string;
  email: string;
  phone: string;
  date: string;
  returnDate?: string;
  destination: string;
  pickup?: string;
  guests: string;
  class?: string;
  hotel?: string;
  cabType?: string;
  bookingId: string;
  pnr?: string;
  fare: number;
  taxes: number;
  total: number;
  details: any;
  timestamp: string;
}

interface HotelData {
  name: string;
  stars: number;
  basePrice: number;
  amenities: string[];
  images: string[];
}

// Hotel image URLs (using Unsplash for high-quality hotel photos)
const hotelImages = {
  luxury: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
  ],
  premium: [
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop",
  ],
  standard: [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&h=600&fit=crop",
  ],
};

// Helper to get images based on star rating
const getHotelImages = (stars: number) => {
  if (stars >= 5) return hotelImages.luxury;
  if (stars >= 4) return hotelImages.premium;
  return hotelImages.standard;
};

// Helper to create hotel entry
const createHotel = (name: string, stars: number, basePrice: number, amenities: string[]): HotelData => ({
  name,
  stars,
  basePrice,
  amenities,
  images: getHotelImages(stars),
});

const hotelOptions: Record<string, HotelData[]> = {
  "Delhi": [
    createHotel("The Imperial", 5, 16000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("The Leela Palace", 5, 20000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Taj Palace", 5, 14000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("ITC Maurya", 5, 15000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Hyatt Regency Delhi", 4, 9000, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Radisson Blu Plaza", 4, 7500, ["WiFi", "Gym", "Restaurant"]),
    createHotel("The LaLiT New Delhi", 4, 8000, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Hotel Janpath", 3, 4000, ["WiFi", "Restaurant"]),
  ],
  "Mumbai": [
    createHotel("Taj Mahal Palace", 5, 15000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("The Oberoi Mumbai", 5, 18000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("ITC Maratha", 5, 12000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("JW Marriott Mumbai", 5, 14500, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Trident Nariman Point", 4, 8500, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Hotel Marine Plaza", 4, 7000, ["WiFi", "Gym", "Restaurant"]),
    createHotel("Fariyas Hotel", 3, 5000, ["WiFi", "Restaurant"]),
    createHotel("Residency Hotel", 3, 4500, ["WiFi", "Restaurant"]),
  ],
  "Bangalore": [
    createHotel("The Oberoi", 5, 13000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("ITC Gardenia", 5, 11000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Taj West End", 5, 12000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("JW Marriott Bengaluru", 5, 13500, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("The Ritz-Carlton", 5, 14000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Shangri-La Bengaluru", 4, 8500, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("The Park Bangalore", 4, 7000, ["WiFi", "Gym", "Restaurant"]),
    createHotel("Royal Orchid Central", 3, 5000, ["WiFi", "Restaurant"]),
  ],
  "Goa": [
    createHotel("Taj Exotica", 5, 14000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("The Leela Goa", 5, 16000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Grand Hyatt", 5, 13000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("ITC Grand Goa", 5, 12500, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Park Hyatt Goa", 5, 15000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Alila Diwa Goa", 4, 9000, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Radisson Blu Resort", 4, 7500, ["WiFi", "Pool", "Restaurant"]),
    createHotel("Goa Marriott Resort", 4, 8000, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Lemon Tree Amarante", 3, 5500, ["WiFi", "Pool", "Restaurant"]),
  ],
  "Jaipur": [
    createHotel("Rambagh Palace", 5, 20000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Oberoi Rajvilas", 5, 16000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Taj Jai Mahal Palace", 5, 15000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("ITC Rajputana", 5, 12000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Hilton Jaipur", 4, 7500, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Radisson Blu Jaipur", 4, 7000, ["WiFi", "Gym", "Restaurant"]),
    createHotel("Park Prime", 3, 4500, ["WiFi", "Restaurant"]),
    createHotel("Hotel Arya Niwas", 3, 3500, ["WiFi", "Restaurant"]),
  ],
  "Agra": [
    createHotel("The Oberoi Amarvilas", 5, 25000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("ITC Mughal", 5, 12000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Taj Hotel & Convention Centre", 5, 14000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Courtyard by Marriott", 4, 8500, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Radisson Blu Agra", 4, 7500, ["WiFi", "Gym", "Restaurant"]),
    createHotel("Howard Plaza", 3, 4000, ["WiFi", "Restaurant"]),
    createHotel("Hotel Clarks Shiraz", 3, 5000, ["WiFi", "Restaurant"]),
  ],
  "Hyderabad": [
    createHotel("Taj Falaknuma Palace", 5, 22000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("ITC Kohenur", 5, 13000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Taj Krishna", 5, 11000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Novotel Hyderabad", 4, 7500, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Marriott Hyderabad", 4, 8500, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Lemon Tree Hotel", 3, 4500, ["WiFi", "Restaurant"]),
  ],
  "Chennai": [
    createHotel("ITC Grand Chola", 5, 14000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Taj Coromandel", 5, 12000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("The Leela Palace", 5, 15000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Hyatt Regency Chennai", 4, 8000, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Radisson Blu Chennai", 4, 7000, ["WiFi", "Gym", "Restaurant"]),
    createHotel("Park Plaza Chennai", 3, 5000, ["WiFi", "Restaurant"]),
  ],
  "Kolkata": [
    createHotel("The Oberoi Grand", 5, 13000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("ITC Sonar", 5, 11000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Taj Bengal", 5, 12000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Hyatt Regency Kolkata", 4, 7500, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("The Park Kolkata", 4, 7000, ["WiFi", "Gym", "Restaurant"]),
    createHotel("Hotel Hindustan International", 3, 4500, ["WiFi", "Restaurant"]),
  ],
  "Pune": [
    createHotel("JW Marriott Pune", 5, 12000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("The Westin Pune", 5, 11000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Conrad Pune", 5, 13000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Hyatt Regency Pune", 4, 8000, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Radisson Blu Pune", 4, 7000, ["WiFi", "Gym", "Restaurant"]),
    createHotel("Hotel Sunderban", 3, 4000, ["WiFi", "Restaurant"]),
  ],
  "Udaipur": [
    createHotel("Taj Lake Palace", 5, 24000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("The Oberoi Udaivilas", 5, 26000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Taj Fateh Prakash Palace", 5, 18000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Trident Udaipur", 4, 9000, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Radisson Blu Udaipur", 4, 8000, ["WiFi", "Gym", "Restaurant"]),
    createHotel("Hotel Lakend", 3, 5000, ["WiFi", "Restaurant"]),
  ],
  "Kochi": [
    createHotel("Taj Malabar Resort & Spa", 5, 12000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Crowne Plaza Kochi", 5, 10000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Grand Hyatt Kochi", 5, 13000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Le Meridien Kochi", 4, 8500, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Radisson Blu Kochi", 4, 7500, ["WiFi", "Gym", "Restaurant"]),
    createHotel("Hotel Abad Plaza", 3, 4500, ["WiFi", "Restaurant"]),
  ],
  "Amritsar": [
    createHotel("Taj Swarna", 5, 10000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Hyatt Regency Amritsar", 5, 11000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Radisson Blu Amritsar", 4, 7000, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Holiday Inn Amritsar", 4, 6500, ["WiFi", "Gym", "Restaurant"]),
    createHotel("Hotel Sawera Grand", 3, 4000, ["WiFi", "Restaurant"]),
    createHotel("Hotel CJ International", 3, 3500, ["WiFi"]),
  ],
  "Varanasi": [
    createHotel("Taj Ganges", 5, 10000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Radisson Hotel Varanasi", 5, 9000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Hotel Surya", 4, 6500, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Rivatas by Ideal", 4, 7000, ["WiFi", "Gym", "Restaurant"]),
    createHotel("Hotel Meraden Grand", 3, 4500, ["WiFi", "Restaurant"]),
    createHotel("Hotel Ganges View", 3, 4000, ["WiFi", "Restaurant"]),
  ],
  "Mysore": [
    createHotel("Lalitha Mahal Palace", 5, 12000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("The Windflower Resort", 5, 10000, ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]),
    createHotel("Radisson Blu Mysore", 4, 7500, ["WiFi", "Pool", "Gym", "Restaurant"]),
    createHotel("Royal Orchid Metropole", 4, 7000, ["WiFi", "Gym", "Restaurant"]),
    createHotel("Hotel Sandesh The Prince", 3, 4500, ["WiFi", "Restaurant"]),
    createHotel("Hotel Pai Vista", 3, 4000, ["WiFi", "Restaurant"]),
  ],
};

const amenityIcons = {
  WiFi: Wifi,
  Pool: Waves,
  Gym: Dumbbell,
  Spa: Sparkles,
  Restaurant: Utensils,
};

const vehicleTypes = [
  { type: "Mini", basePrice: 10, capacity: 4, category: "cab" },
  { type: "Sedan", basePrice: 15, capacity: 4, category: "cab" },
  { type: "SUV", basePrice: 20, capacity: 6, category: "cab" },
  { type: "Luxury", basePrice: 35, capacity: 4, category: "cab" },
  { type: "Tempo Traveller", basePrice: 25, capacity: 12, category: "bus" },
  { type: "Mini Bus", basePrice: 40, capacity: 20, category: "bus" },
  { type: "Coach Bus", basePrice: 55, capacity: 40, category: "bus" },
  { type: "Luxury Coach", basePrice: 75, capacity: 45, category: "bus" },
  { type: "Sleeper Bus", basePrice: 65, capacity: 30, category: "bus" },
];

const flightClasses = {
  economy: { multiplier: 1, name: "Economy" },
  premium: { multiplier: 1.5, name: "Premium Economy" },
  business: { multiplier: 2.5, name: "Business Class" },
  first: { multiplier: 4, name: "First Class" },
};

const Bookings = () => {
  const [bookingType, setBookingType] = useState<"hotel" | "cab" | "flight">("hotel");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [savedBookings, setSavedBookings] = useState<Booking[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryHotel, setGalleryHotel] = useState<HotelData | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showRealResults, setShowRealResults] = useState(false);
  const [selectedRealHotel, setSelectedRealHotel] = useState<RealHotel | null>(null);
  const [selectedRealFlight, setSelectedRealFlight] = useState<RealFlight | null>(null);
  const [checkOutDate, setCheckOutDate] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    returnDate: "",
    destination: "Delhi",
    pickup: "",
    guests: "1",
    class: "economy",
    hotel: "",
    cabType: "Sedan",
    distance: "10",
    budgetClass: "middle", // Added budget class for travelers
  });
  const { toast } = useToast();
  
  const {
    isSearchingHotels,
    isSearchingFlights,
    realHotels,
    realFlights,
    searchRealHotels,
    searchRealFlights,
    formatDuration,
    formatDateTime,
  } = useRealBookings();

  const cities = Object.keys(hotelOptions);

  // Get star range based on budget class
  const getStarRangeForBudget = (budgetClass: string): number[] => {
    switch (budgetClass) {
      case "budget":
        return [3]; // Budget shows 3-star hotels
      case "middle":
        return [4]; // Mid-Range shows 4-star hotels
      case "luxury":
        return [5]; // Luxury shows 5-star hotels
      default:
        return [3, 4, 5]; // Show all if not specified
    }
  };
  
  const filteredHotels = selectedCity 
    ? hotelOptions[selectedCity].filter(hotel => {
        const starRange = getStarRangeForBudget(formData.budgetClass);
        const matchesBudget = starRange.includes(hotel.stars);
        const matchesAmenities = selectedAmenities.length === 0 || 
          selectedAmenities.every(amenity => hotel.amenities.includes(amenity));
        return matchesBudget && matchesAmenities;
      })
    : [];

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const openGallery = (hotel: HotelData) => {
    setGalleryHotel(hotel);
    setCurrentImageIndex(0);
    setShowGallery(true);
  };

  const nextImage = () => {
    if (galleryHotel) {
      setCurrentImageIndex((prev) => 
        prev === galleryHotel.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (galleryHotel) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? galleryHotel.images.length - 1 : prev - 1
      );
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("bookings");
    if (saved) {
      setSavedBookings(JSON.parse(saved));
    }
  }, []);

  // Airport code mapping for Indian cities
  const cityToAirportCode: Record<string, string> = {
    "Delhi": "DEL",
    "Mumbai": "BOM",
    "Bangalore": "BLR",
    "Chennai": "MAA",
    "Kolkata": "CCU",
    "Hyderabad": "HYD",
    "Goa": "GOI",
    "Jaipur": "JAI",
    "Pune": "PNQ",
    "Ahmedabad": "AMD",
    "Kochi": "COK",
    "Lucknow": "LKO",
    "Amritsar": "ATQ",
    "Varanasi": "VNS",
    "Udaipur": "UDR",
    "Agra": "AGR",
    "Mysore": "MYQ",
  };

  const handleSearchRealHotels = async () => {
    if (!selectedCity || !formData.date || !checkOutDate) {
      toast({
        title: "Missing Information",
        description: "Please select a city and dates to search for hotels",
        variant: "destructive",
      });
      return;
    }
    
    setShowRealResults(true);
    await searchRealHotels(
      selectedCity,
      formData.date,
      checkOutDate,
      parseInt(formData.guests),
      1
    );
  };

  const handleSearchRealFlights = async () => {
    if (!formData.pickup || !formData.destination || !formData.date) {
      toast({
        title: "Missing Information",
        description: "Please select origin, destination and date to search for flights",
        variant: "destructive",
      });
      return;
    }
    
    const originCode = cityToAirportCode[formData.pickup] || formData.pickup;
    const destCode = cityToAirportCode[formData.destination] || formData.destination;
    const travelClass = formData.class.toUpperCase() === "ECONOMY" ? "ECONOMY" : 
                        formData.class.toUpperCase() === "PREMIUM" ? "PREMIUM_ECONOMY" :
                        formData.class.toUpperCase() === "BUSINESS" ? "BUSINESS" : "FIRST";
    
    setShowRealResults(true);
    await searchRealFlights(
      originCode,
      destCode,
      formData.date,
      formData.returnDate || undefined,
      parseInt(formData.guests),
      travelClass
    );
  };

  const selectRealHotel = (hotel: RealHotel) => {
    setSelectedRealHotel(hotel);
    setFormData({ 
      ...formData, 
      hotel: hotel.name, 
      destination: selectedCity 
    });
    toast({
      title: "Hotel Selected",
      description: `${hotel.name} - ${hotel.currency} ${hotel.price}`,
    });
  };

  const selectRealFlight = (flight: RealFlight) => {
    setSelectedRealFlight(flight);
    toast({
      title: "Flight Selected",
      description: `${flight.airline} - ${flight.currency} ${flight.price}`,
    });
  };

  const generateBookingId = () => {
    return `BK${Date.now().toString().slice(-8)}`;
  };

  const generatePNR = () => {
    return `PNR${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };

  const sendConfirmationEmail = async (booking: Booking) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-booking-confirmation', {
        body: {
          email: booking.email,
          name: booking.name,
          bookingType: booking.type,
          bookingId: booking.bookingId,
          pnr: booking.pnr,
          destination: booking.destination,
          date: booking.date,
          returnDate: booking.returnDate,
          guests: booking.guests,
          hotel: booking.hotel,
          cabType: booking.cabType,
          pickup: booking.pickup,
          flightClass: booking.class,
          fare: booking.fare,
          taxes: booking.taxes,
          total: booking.total,
        },
      });

      if (error) {
        console.error('Email error:', error);
        toast({
          title: "Booking Confirmed",
          description: "Your booking is confirmed but we couldn't send the confirmation email.",
          variant: "default",
        });
      } else {
        toast({
          title: "Email Sent",
          description: `Confirmation email sent to ${booking.email}`,
        });
      }
    } catch (err) {
      console.error('Error sending email:', err);
    }
  };

  const sendConfirmationSms = async (booking: Booking) => {
    if (!booking.phone) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('send-booking-sms', {
        body: {
          phoneNumber: booking.phone,
          bookingType: booking.type,
          bookingDetails: {
            name: booking.name,
            destination: booking.destination,
            origin: booking.pickup,
            checkIn: booking.date,
            checkOut: booking.returnDate,
            departureDate: booking.date,
            returnDate: booking.returnDate,
            price: `₹${booking.total.toLocaleString()}`,
            hotelName: booking.hotel,
            airline: booking.type === 'flight' ? 'Your selected airline' : undefined,
          },
        },
      });

      if (error) {
        console.error('SMS error:', error);
        toast({
          title: "SMS Not Sent",
          description: "Booking confirmed but we couldn't send the SMS notification.",
          variant: "default",
        });
      } else {
        toast({
          title: "SMS Sent",
          description: `Confirmation SMS sent to ${booking.phone}`,
        });
      }
    } catch (err) {
      console.error('Error sending SMS:', err);
    }
  };

  const sendConfirmationWhatsApp = async (booking: Booking) => {
    if (!booking.phone) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('send-booking-whatsapp', {
        body: {
          phoneNumber: booking.phone,
          bookingType: booking.type,
          bookingDetails: {
            name: booking.name,
            destination: booking.destination,
            origin: booking.pickup,
            checkIn: booking.date,
            checkOut: booking.returnDate,
            departureDate: booking.date,
            returnDate: booking.returnDate,
            price: `₹${booking.total.toLocaleString()}`,
            hotelName: booking.hotel,
            airline: booking.type === 'flight' ? 'Your selected airline' : undefined,
            bookingId: booking.bookingId,
          },
        },
      });

      if (error) {
        console.error('WhatsApp error:', error);
      } else {
        toast({
          title: "WhatsApp Sent",
          description: `Confirmation sent via WhatsApp to ${booking.phone}`,
        });
      }
    } catch (err) {
      console.error('Error sending WhatsApp:', err);
    }
  };

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const initiatePayment = async (booking: Booking) => {
    setIsProcessingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-booking-payment', {
        body: {
          amount: booking.total,
          currency: 'inr',
          bookingType: booking.type,
          bookingDetails: {
            name: booking.name,
            email: booking.email,
            destination: booking.destination,
            date: booking.date,
            hotelName: booking.hotel,
            origin: booking.pickup,
            returnDate: booking.returnDate,
          },
        },
      });

      if (error) {
        console.error('Payment error:', error);
        toast({
          title: "Payment Failed",
          description: "Could not initiate payment. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error initiating payment:', err);
      toast({
        title: "Payment Error",
        description: "An error occurred while processing payment.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const calculateHotelCost = () => {
    const hotels = hotelOptions[formData.destination as keyof typeof hotelOptions] || hotelOptions["Delhi"];
    const selectedHotel = hotels.find(h => h.name === formData.hotel) || hotels[0];
    const baseFare = selectedHotel.basePrice * parseInt(formData.guests);
    const taxes = Math.round(baseFare * 0.18);
    return { fare: baseFare, taxes, total: baseFare + taxes, hotel: selectedHotel };
  };

  const calculateCabCost = () => {
    const vehicle = vehicleTypes.find(v => v.type === formData.cabType) || vehicleTypes[0];
    const distance = parseInt(formData.distance) || 10;
    const baseFare = vehicle.basePrice * distance;
    const taxes = Math.round(baseFare * 0.05);
    return { fare: baseFare, taxes, total: baseFare + taxes, cab: vehicle };
  };

  const calculateFlightCost = () => {
    const basePrice = 5000;
    const classInfo = flightClasses[formData.class as keyof typeof flightClasses];
    const baseFare = Math.round(basePrice * classInfo.multiplier * parseInt(formData.guests));
    const taxes = Math.round(baseFare * 0.12);
    return { fare: baseFare, taxes, total: baseFare + taxes, classInfo };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate number of guests/customers first
    const guestsCount = parseInt(formData.guests);
    if (!guestsCount || guestsCount < 1) {
      toast({
        title: "Number of Customers Required",
        description: "Please select the number of guests/passengers before proceeding",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    let booking: Booking;
    const bookingId = generateBookingId();
    const timestamp = new Date().toISOString();

    if (bookingType === "hotel") {
      const cost = calculateHotelCost();
      booking = {
        id: bookingId,
        type: "hotel",
        bookingId,
        ...formData,
        fare: cost.fare,
        taxes: cost.taxes,
        total: cost.total,
        details: { hotel: cost.hotel },
        timestamp,
      };
    } else if (bookingType === "cab") {
      const cost = calculateCabCost();
      booking = {
        id: bookingId,
        type: "cab",
        bookingId,
        ...formData,
        fare: cost.fare,
        taxes: cost.taxes,
        total: cost.total,
        details: { cab: cost.cab, distance: formData.distance },
        timestamp,
      };
    } else {
      const cost = calculateFlightCost();
      const pnr = generatePNR();
      booking = {
        id: bookingId,
        type: "flight",
        bookingId,
        pnr,
        ...formData,
        fare: cost.fare,
        taxes: cost.taxes,
        total: cost.total,
        details: { classInfo: cost.classInfo },
        timestamp,
      };
    }

    setConfirmedBooking(booking);
    const updatedBookings = [...savedBookings, booking];
    setSavedBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    setShowConfirmation(true);
    
    // Send confirmation email (using new rich HTML template), SMS, and WhatsApp
    sendConfirmationEmail(booking);
    sendConfirmationSms(booking);
    sendConfirmationWhatsApp(booking);
    
    // Send push notification
    sendPushNotification(booking);
  };

  const sendPushNotification = async (booking: Booking) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const bookingTypeLabel = booking.type === "hotel" ? "Hotel" : 
                               booking.type === "flight" ? "Flight" : "Cab";

      await supabase.functions.invoke('send-push-notification', {
        body: {
          action: 'send',
          userId: user.id,
          payload: {
            title: `${bookingTypeLabel} Booking Confirmed!`,
            body: `Your booking ${booking.bookingId} to ${booking.destination} is confirmed. Total: ₹${booking.total.toLocaleString()}`,
            tag: `booking-${booking.bookingId}`,
            data: { url: '/bookings', bookingId: booking.bookingId },
          },
        },
      });
    } catch (err) {
      console.error('Error sending push notification:', err);
    }
  };

  const downloadReceipt = () => {
    if (!confirmedBooking) return;
    
    const receiptContent = `
INDIA ASSIST - BOOKING RECEIPT
================================

Booking ID: ${confirmedBooking.bookingId}
${confirmedBooking.pnr ? `PNR: ${confirmedBooking.pnr}` : ''}
Type: ${confirmedBooking.type.toUpperCase()}
Date: ${new Date(confirmedBooking.timestamp).toLocaleString()}

PASSENGER DETAILS
----------------
Name: ${confirmedBooking.name}
Email: ${confirmedBooking.email}
Phone: ${confirmedBooking.phone}

BOOKING DETAILS
--------------
${confirmedBooking.type === 'hotel' ? `Hotel: ${confirmedBooking.hotel}\nStars: ${confirmedBooking.details.hotel.stars}⭐` : ''}
${confirmedBooking.type === 'cab' ? `Cab Type: ${confirmedBooking.cabType}\nDistance: ${confirmedBooking.details.distance} km` : ''}
${confirmedBooking.type === 'flight' ? `From: ${confirmedBooking.pickup}\nTo: ${confirmedBooking.destination}\nClass: ${confirmedBooking.details.classInfo.name}` : ''}
Destination: ${confirmedBooking.destination}
Date: ${confirmedBooking.date}
${confirmedBooking.returnDate ? `Return: ${confirmedBooking.returnDate}` : ''}
Guests/Passengers: ${confirmedBooking.guests}

PAYMENT BREAKDOWN
----------------
Base Fare: ₹${confirmedBooking.fare.toLocaleString()}
Taxes & Fees: ₹${confirmedBooking.taxes.toLocaleString()}
Total Amount: ₹${confirmedBooking.total.toLocaleString()}

Thank you for choosing India Assist!
For support: support@indiaassist.com | +91 1800-123-4567
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IndiaAssist_Receipt_${confirmedBooking.bookingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Receipt Downloaded",
      description: "Your booking receipt has been downloaded successfully",
    });
  };

  const printReceipt = () => {
    window.print();
    toast({
      title: "Printing...",
      description: "Your receipt is being prepared for printing",
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">Book Your Experience</h1>
          <p className="text-xl text-muted-foreground">
            Reserve hotels, flights, and cabs for your India journey
          </p>
        </div>

        <Card className="shadow-lg-custom mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {bookingType === "hotel" && <Hotel className="h-5 w-5 text-primary" />}
              {bookingType === "flight" && <Plane className="h-5 w-5 text-primary" />}
              {bookingType === "cab" && <Car className="h-5 w-5 text-primary" />}
              Booking Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Booking Type Selection */}
              <div className="grid grid-cols-3 gap-4">
                <Button
                  type="button"
                  variant={bookingType === "hotel" ? "default" : "outline"}
                  onClick={() => setBookingType("hotel")}
                  className="h-20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Hotel className="h-6 w-6" />
                    <span>Hotel</span>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={bookingType === "flight" ? "default" : "outline"}
                  onClick={() => setBookingType("flight")}
                  className="h-20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Plane className="h-6 w-6" />
                    <span>Flight</span>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={bookingType === "cab" ? "default" : "outline"}
                  onClick={() => setBookingType("cab")}
                  className="h-20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Car className="h-6 w-6" />
                    <span>Cab</span>
                  </div>
                </Button>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 XXXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Booking Details</h3>
                
                {bookingType === "hotel" ? (
                  <>
                    {/* City Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="city-select">Select City *</Label>
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger id="city-select">
                          <SelectValue placeholder="Choose a city" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amenities Filter */}
                    {selectedCity && (
                      <div className="space-y-3">
                        <Label>Filter by Amenities</Label>
                        <div className="flex flex-wrap gap-3">
                          {Object.entries(amenityIcons).map(([amenity, Icon]) => (
                            <div key={amenity} className="flex items-center space-x-2">
                              <Checkbox
                                id={amenity}
                                checked={selectedAmenities.includes(amenity)}
                                onCheckedChange={() => toggleAmenity(amenity)}
                              />
                              <label
                                htmlFor={amenity}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                              >
                                <Icon className="h-4 w-4" />
                                {amenity}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hotel Cards */}
                    {selectedCity && filteredHotels.length > 0 && (
                      <div className="space-y-3">
                        <Label>Available Hotels ({filteredHotels.length})</Label>
                        <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
                          {filteredHotels.map((hotel, index) => (
                            <motion.div
                              key={hotel.name}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Card 
                                className={`cursor-pointer transition-all hover:shadow-lg ${
                                  formData.hotel === hotel.name ? 'ring-2 ring-primary shadow-lg' : ''
                                }`}
                                onClick={() => {
                                  setFormData({ ...formData, hotel: hotel.name, destination: selectedCity });
                                }}
                              >
                                <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-semibold text-lg">{hotel.name}</h4>
                                    <div className="flex items-center gap-1 mt-1">
                                      {Array.from({ length: hotel.stars }).map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-golden text-golden" />
                                      ))}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-primary">
                                      ₹{hotel.basePrice.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">per night</p>
                                  </div>
                                </div>
                                
                                {/* Amenities */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {hotel.amenities.map((amenity) => {
                                    const Icon = amenityIcons[amenity as keyof typeof amenityIcons];
                                    return (
                                      <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                                        {Icon && <Icon className="h-3 w-3" />}
                                        {amenity}
                                      </Badge>
                                    );
                                  })}
                                </div>

                                {/* View Gallery Button */}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openGallery(hotel);
                                  }}
                                >
                                  <ImageIcon className="h-4 w-4 mr-2" />
                                  View Photos
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCity && filteredHotels.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No hotels match the selected amenities. Try adjusting your filters.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination/City *</Label>
                    <Select value={formData.destination} onValueChange={(value) => setFormData({ ...formData, destination: value })}>
                      <SelectTrigger id="destination">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {bookingType === "cab" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cabType">Vehicle Type *</Label>
                      <Select value={formData.cabType} onValueChange={(value) => setFormData({ ...formData, cabType: value })}>
                        <SelectTrigger id="cabType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">🚗 Cabs</div>
                          {vehicleTypes.filter(v => v.category === "cab").map((vehicle) => (
                            <SelectItem key={vehicle.type} value={vehicle.type}>
                              {vehicle.type} - ₹{vehicle.basePrice}/km (Capacity: {vehicle.capacity})
                            </SelectItem>
                          ))}
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-t mt-1 pt-2">🚌 Buses</div>
                          {vehicleTypes.filter(v => v.category === "bus").map((vehicle) => (
                            <SelectItem key={vehicle.type} value={vehicle.type}>
                              {vehicle.type} - ₹{vehicle.basePrice}/km (Capacity: {vehicle.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickup">Pickup Location *</Label>
                      <Input
                        id="pickup"
                        placeholder="Enter pickup address"
                        value={formData.pickup}
                        onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="distance">Estimated Distance (km) *</Label>
                      <Input
                        id="distance"
                        type="number"
                        min="1"
                        value={formData.distance}
                        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                {bookingType === "flight" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="pickup">From (City) *</Label>
                      <Select value={formData.pickup} onValueChange={(value) => setFormData({ ...formData, pickup: value })}>
                        <SelectTrigger id="pickup">
                          <SelectValue placeholder="Select departure city" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class">Flight Class *</Label>
                      <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                        <SelectTrigger id="class">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(flightClasses).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {bookingType === "hotel" ? "Check-in Date *" : bookingType === "flight" ? "Departure Date *" : "Pickup Date *"}
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  {bookingType === "hotel" && (
                    <div className="space-y-2">
                      <Label htmlFor="checkOutDate">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Check-out Date *
                      </Label>
                      <Input
                        id="checkOutDate"
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  {bookingType === "flight" && (
                    <div className="space-y-2">
                      <Label htmlFor="returnDate">Return Date</Label>
                      <Input
                        id="returnDate"
                        type="date"
                        value={formData.returnDate}
                        onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* Real API Search Button */}
                {(bookingType === "hotel" || bookingType === "flight") && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={bookingType === "hotel" ? handleSearchRealHotels : handleSearchRealFlights}
                    disabled={isSearchingHotels || isSearchingFlights}
                  >
                    {(isSearchingHotels || isSearchingFlights) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Searching Live Availability...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search Live {bookingType === "hotel" ? "Hotels" : "Flights"} (Amadeus API)
                      </>
                    )}
                  </Button>
                )}

                {/* Real Hotel Results */}
                {bookingType === "hotel" && showRealResults && realHotels.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">Live Hotel Results ({realHotels.length})</Label>
                      <Badge variant="secondary" className="bg-emerald/10 text-emerald">
                        Real-time from Amadeus
                      </Badge>
                    </div>
                    <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
                      {realHotels.map((hotel, index) => (
                        <motion.div
                          key={hotel.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-all hover:shadow-lg ${
                              selectedRealHotel?.id === hotel.id ? 'ring-2 ring-primary shadow-lg' : ''
                            }`}
                            onClick={() => selectRealHotel(hotel)}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-lg">{hotel.name}</h4>
                                  <p className="text-sm text-muted-foreground">{hotel.address}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    {Array.from({ length: Math.round(hotel.rating) }).map((_, i) => (
                                      <Star key={i} className="h-4 w-4 fill-golden text-golden" />
                                    ))}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-primary">
                                    {hotel.currency} {hotel.price.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{hotel.roomType}</p>
                                  {hotel.isRealBooking && (
                                    <Badge className="mt-1 bg-emerald text-emerald-foreground">Live</Badge>
                                  )}
                                </div>
                              </div>
                              {hotel.description && (
                                <p className="text-sm text-muted-foreground mt-2">{hotel.description}</p>
                              )}
                              {hotel.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {hotel.amenities.slice(0, 5).map((amenity) => (
                                    <Badge key={amenity} variant="outline" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Real Flight Results */}
                {bookingType === "flight" && showRealResults && realFlights.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">Live Flight Results ({realFlights.length})</Label>
                      <Badge variant="secondary" className="bg-emerald/10 text-emerald">
                        Real-time from Amadeus
                      </Badge>
                    </div>
                    <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
                      {realFlights.map((flight, index) => (
                        <motion.div
                          key={flight.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-all hover:shadow-lg ${
                              selectedRealFlight?.id === flight.id ? 'ring-2 ring-primary shadow-lg' : ''
                            }`}
                            onClick={() => selectRealFlight(flight)}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold text-lg">{flight.airline}</h4>
                                  <Badge variant="outline">{flight.travelClass}</Badge>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-primary">
                                    {flight.currency} {flight.price.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {flight.seatsAvailable} seats left
                                  </p>
                                  {flight.isRealBooking && (
                                    <Badge className="mt-1 bg-emerald text-emerald-foreground">Live</Badge>
                                  )}
                              </div>
                            </div>
                            
                            {/* Outbound Flight */}
                            <div className="border rounded-lg p-3 mb-2">
                              <div className="flex items-center justify-between">
                                <div className="text-center">
                                  <p className="font-semibold">{flight.outbound.departure}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDateTime(flight.outbound.departureTime)}
                                  </p>
                                </div>
                                <div className="flex-1 px-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="h-px bg-border flex-1"></div>
                                    <Plane className="h-4 w-4 text-primary" />
                                    <div className="h-px bg-border flex-1"></div>
                                  </div>
                                  <p className="text-xs text-center text-muted-foreground">
                                    {formatDuration(flight.outbound.duration)} • {flight.outbound.stops === 0 ? 'Direct' : `${flight.outbound.stops} stop(s)`}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="font-semibold">{flight.outbound.arrival}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDateTime(flight.outbound.arrivalTime)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Inbound Flight */}
                            {flight.inbound && (
                              <div className="border rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div className="text-center">
                                    <p className="font-semibold">{flight.inbound.departure}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatDateTime(flight.inbound.departureTime)}
                                    </p>
                                  </div>
                                  <div className="flex-1 px-4">
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="h-px bg-border flex-1"></div>
                                      <Plane className="h-4 w-4 text-primary rotate-180" />
                                      <div className="h-px bg-border flex-1"></div>
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground">
                                      {formatDuration(flight.inbound.duration)} • {flight.inbound.stops === 0 ? 'Direct' : `${flight.inbound.stops} stop(s)`}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-semibold">{flight.inbound.arrival}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatDateTime(flight.inbound.arrivalTime)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Number of Guests/Passengers - Prominent Input Box */}
                <Card className="border-2 border-primary/30 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Label htmlFor="guests" className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Enter Number of {bookingType === "hotel" ? "Guests" : "Passengers"} *
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Please enter the total number of people (required for accurate budget calculation)
                      </p>
                      <Input
                        id="guests"
                        type="number"
                        min="1"
                        max="100"
                        placeholder={`Enter number of ${bookingType === "hotel" ? "guests" : "passengers"} (1-100)`}
                        value={formData.guests}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          setFormData({ ...formData, guests: value.toString() });
                        }}
                        className="text-lg h-12 font-semibold"
                        required
                      />
                      {parseInt(formData.guests) > 0 && (
                        <p className="text-sm text-primary font-medium">
                          ✓ {formData.guests} {parseInt(formData.guests) === 1 ? (bookingType === "hotel" ? "guest" : "passenger") : (bookingType === "hotel" ? "guests" : "passengers")} selected
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label htmlFor="budgetClass">
                    Budget Category
                  </Label>
                  <Select value={formData.budgetClass} onValueChange={(value) => setFormData({ ...formData, budgetClass: value })}>
                    <SelectTrigger id="budgetClass">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">💰 Budget Traveler (Economy options)</SelectItem>
                      <SelectItem value="middle">🏨 Mid-Range (Comfort & value)</SelectItem>
                      <SelectItem value="luxury">👑 Luxury (Premium experience)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cost Estimate */}
                {formData.hotel && bookingType === "hotel" && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Base Fare:</span>
                          <span>₹{calculateHotelCost().fare.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Taxes (18%):</span>
                          <span>₹{calculateHotelCost().taxes.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total:</span>
                          <span className="text-primary">₹{calculateHotelCost().total.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {bookingType === "cab" && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Base Fare:</span>
                          <span>₹{calculateCabCost().fare.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Taxes (5%):</span>
                          <span>₹{calculateCabCost().taxes.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total:</span>
                          <span className="text-primary">₹{calculateCabCost().total.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {bookingType === "flight" && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Base Fare:</span>
                          <span>₹{calculateFlightCost().fare.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Taxes (12%):</span>
                          <span>₹{calculateFlightCost().taxes.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total:</span>
                          <span className="text-primary">₹{calculateFlightCost().total.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Button type="submit" className="w-full gradient-hero text-white" size="lg">
                Confirm Booking
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Booking Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-emerald/10 dark:bg-emerald/20 flex items-center justify-center animate-scale-in">
                  <CheckCircle className="h-10 w-10 text-emerald dark:text-emerald" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">Booking Confirmed! 🎉</DialogTitle>
              <DialogDescription className="text-center">
                Your {confirmedBooking?.type} booking has been successfully confirmed
              </DialogDescription>
            </DialogHeader>
            {confirmedBooking && (
              <div className="space-y-4 py-4">
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">Booking ID</p>
                      <p className="text-2xl font-bold text-primary">{confirmedBooking.bookingId}</p>
                      {confirmedBooking.pnr && (
                        <>
                          <p className="text-sm text-muted-foreground mt-2">PNR</p>
                          <p className="text-xl font-bold">{confirmedBooking.pnr}</p>
                        </>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{confirmedBooking.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{confirmedBooking.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{confirmedBooking.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">{confirmedBooking.date}</span>
                      </div>
                      {confirmedBooking.type === "hotel" && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hotel:</span>
                          <span className="font-medium">{confirmedBooking.hotel} - {confirmedBooking.details.hotel.stars}⭐</span>
                        </div>
                      )}
                      {confirmedBooking.type === "cab" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cab Type:</span>
                            <span className="font-medium">{confirmedBooking.cabType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Distance:</span>
                            <span className="font-medium">{confirmedBooking.details.distance} km</span>
                          </div>
                        </>
                      )}
                      {confirmedBooking.type === "flight" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">From:</span>
                            <span className="font-medium">{confirmedBooking.pickup}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">To:</span>
                            <span className="font-medium">{confirmedBooking.destination}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Class:</span>
                            <span className="font-medium">{confirmedBooking.details.classInfo.name}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base Fare:</span>
                        <span>₹{confirmedBooking.fare.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxes:</span>
                        <span>₹{confirmedBooking.taxes.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2">
                        <span>Total Amount:</span>
                        <span className="text-primary">₹{confirmedBooking.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <p className="text-sm text-center text-muted-foreground">
                    ℹ️ This is a demo booking. No actual reservation has been made. You can download your receipt or proceed to payment below.
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <Button 
                onClick={() => confirmedBooking && initiatePayment(confirmedBooking)} 
                className="w-full gradient-saffron text-white"
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now - ₹{confirmedBooking?.total.toLocaleString()}
                  </>
                )}
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={downloadReceipt} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={printReceipt} className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="ghost" onClick={() => setShowConfirmation(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Photo Gallery Dialog */}
        <Dialog open={showGallery} onOpenChange={setShowGallery}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                {galleryHotel?.name} - Photo Gallery
              </DialogTitle>
              <DialogDescription>
                {galleryHotel?.stars}⭐ Hotel | ₹{galleryHotel?.basePrice.toLocaleString()}/night
              </DialogDescription>
            </DialogHeader>
            {galleryHotel && (
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={galleryHotel.images[currentImageIndex]} 
                    alt={`${galleryHotel.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Navigation Buttons */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-background/80 px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {galleryHotel.images.length}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {galleryHotel.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-transparent hover:border-muted-foreground/50'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Hotel Info */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {galleryHotel.amenities.map((amenity) => {
                      const Icon = amenityIcons[amenity as keyof typeof amenityIcons];
                      return (
                        <Badge key={amenity} variant="outline" className="flex items-center gap-1">
                          {Icon && <Icon className="h-3 w-3" />}
                          {amenity}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={() => {
                  if (galleryHotel && selectedCity) {
                    setFormData({ ...formData, hotel: galleryHotel.name, destination: selectedCity });
                    setShowGallery(false);
                  }
                }} 
                className="flex-1 gradient-hero text-white"
              >
                Select This Hotel
              </Button>
              <Button variant="outline" onClick={() => setShowGallery(false)} className="flex-1">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Bookings;