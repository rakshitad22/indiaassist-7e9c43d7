import { useState, useEffect } from "react";
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

const hotelOptions: Record<string, HotelData[]> = {
  "Delhi": [
    { 
      name: "The Imperial", 
      stars: 5, 
      basePrice: 16000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "The Leela Palace", 
      stars: 5, 
      basePrice: 20000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Taj Palace", 
      stars: 5, 
      basePrice: 14000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "ITC Maurya", 
      stars: 5, 
      basePrice: 15000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hyatt Regency Delhi", 
      stars: 4, 
      basePrice: 9000,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Radisson Blu Plaza", 
      stars: 4, 
      basePrice: 7500,
      amenities: ["WiFi", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "The LaLiT New Delhi", 
      stars: 4, 
      basePrice: 8000,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hotel Janpath", 
      stars: 3, 
      basePrice: 4000,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
  ],
  "Mumbai": [
    { 
      name: "Taj Mahal Palace", 
      stars: 5, 
      basePrice: 15000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "The Oberoi Mumbai", 
      stars: 5, 
      basePrice: 18000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "ITC Maratha", 
      stars: 5, 
      basePrice: 12000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "JW Marriott Mumbai", 
      stars: 5, 
      basePrice: 14500,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Trident Nariman Point", 
      stars: 4, 
      basePrice: 8500,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hotel Marine Plaza", 
      stars: 4, 
      basePrice: 7000,
      amenities: ["WiFi", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Fariyas Hotel", 
      stars: 3, 
      basePrice: 5000,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Residency Hotel", 
      stars: 3, 
      basePrice: 4500,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
  ],
  "Bangalore": [
    { 
      name: "The Oberoi", 
      stars: 5, 
      basePrice: 13000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "ITC Gardenia", 
      stars: 5, 
      basePrice: 11000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Taj West End", 
      stars: 5, 
      basePrice: 12000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "JW Marriott Bengaluru", 
      stars: 5, 
      basePrice: 13500,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "The Ritz-Carlton", 
      stars: 5, 
      basePrice: 14000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Shangri-La Bengaluru", 
      stars: 4, 
      basePrice: 8500,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "The Park Bangalore", 
      stars: 4, 
      basePrice: 7000,
      amenities: ["WiFi", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Royal Orchid Central", 
      stars: 3, 
      basePrice: 5000,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
  ],
  "Goa": [
    { 
      name: "Taj Exotica", 
      stars: 5, 
      basePrice: 14000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "The Leela Goa", 
      stars: 5, 
      basePrice: 16000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Grand Hyatt", 
      stars: 5, 
      basePrice: 13000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "ITC Grand Goa", 
      stars: 5, 
      basePrice: 12500,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Park Hyatt Goa", 
      stars: 5, 
      basePrice: 15000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Alila Diwa Goa", 
      stars: 4, 
      basePrice: 9000,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Radisson Blu Resort", 
      stars: 4, 
      basePrice: 7500,
      amenities: ["WiFi", "Pool", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Goa Marriott Resort", 
      stars: 4, 
      basePrice: 8000,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Lemon Tree Amarante", 
      stars: 3, 
      basePrice: 5500,
      amenities: ["WiFi", "Pool", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
  ],
  "Jaipur": [
    { 
      name: "Rambagh Palace", 
      stars: 5, 
      basePrice: 20000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Oberoi Rajvilas", 
      stars: 5, 
      basePrice: 16000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Taj Jai Mahal Palace", 
      stars: 5, 
      basePrice: 15000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "ITC Rajputana", 
      stars: 5, 
      basePrice: 12000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hilton Jaipur", 
      stars: 4, 
      basePrice: 7500,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Radisson Blu Jaipur", 
      stars: 4, 
      basePrice: 7000,
      amenities: ["WiFi", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Park Prime", 
      stars: 3, 
      basePrice: 4500,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hotel Arya Niwas", 
      stars: 3, 
      basePrice: 3500,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
  ],
  "Agra": [
    { 
      name: "The Oberoi Amarvilas", 
      stars: 5, 
      basePrice: 25000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "ITC Mughal", 
      stars: 5, 
      basePrice: 12000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Taj Hotel & Convention Centre", 
      stars: 5, 
      basePrice: 14000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Courtyard by Marriott", 
      stars: 4, 
      basePrice: 8500,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Radisson Blu Agra", 
      stars: 4, 
      basePrice: 7500,
      amenities: ["WiFi", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Howard Plaza", 
      stars: 3, 
      basePrice: 4000,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hotel Clarks Shiraz", 
      stars: 3, 
      basePrice: 5000,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
  ],
  "Hyderabad": [
    { 
      name: "Taj Falaknuma Palace", 
      stars: 5, 
      basePrice: 22000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "ITC Kohenur", 
      stars: 5, 
      basePrice: 13000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Taj Krishna", 
      stars: 5, 
      basePrice: 11000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Novotel Hyderabad", 
      stars: 4, 
      basePrice: 7500,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Marriott Hyderabad", 
      stars: 4, 
      basePrice: 8500,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Lemon Tree Hotel", 
      stars: 3, 
      basePrice: 4500,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
  ],
  "Chennai": [
    { 
      name: "ITC Grand Chola", 
      stars: 5, 
      basePrice: 14000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Taj Coromandel", 
      stars: 5, 
      basePrice: 12000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "The Leela Palace", 
      stars: 5, 
      basePrice: 15000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hyatt Regency Chennai", 
      stars: 4, 
      basePrice: 8000,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Radisson Blu Chennai", 
      stars: 4, 
      basePrice: 7000,
      amenities: ["WiFi", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Park Plaza Chennai", 
      stars: 3, 
      basePrice: 5000,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
  ],
  "Kolkata": [
    { 
      name: "The Oberoi Grand", 
      stars: 5, 
      basePrice: 13000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "ITC Sonar", 
      stars: 5, 
      basePrice: 11000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Taj Bengal", 
      stars: 5, 
      basePrice: 12000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hyatt Regency Kolkata", 
      stars: 4, 
      basePrice: 7500,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "The Park Kolkata", 
      stars: 4, 
      basePrice: 7000,
      amenities: ["WiFi", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hotel Hindustan International", 
      stars: 3, 
      basePrice: 4500,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
  ],
  "Pune": [
    { 
      name: "JW Marriott Pune", 
      stars: 5, 
      basePrice: 12000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "The Westin Pune", 
      stars: 5, 
      basePrice: 11000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Conrad Pune", 
      stars: 5, 
      basePrice: 13000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hyatt Regency Pune", 
      stars: 4, 
      basePrice: 8000,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Radisson Blu Pune", 
      stars: 4, 
      basePrice: 7000,
      amenities: ["WiFi", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hotel Sunderban", 
      stars: 3, 
      basePrice: 4000,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
  ],
  "Udaipur": [
    { 
      name: "Taj Lake Palace", 
      stars: 5, 
      basePrice: 24000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "The Oberoi Udaivilas", 
      stars: 5, 
      basePrice: 26000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Taj Fateh Prakash Palace", 
      stars: 5, 
      basePrice: 18000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Trident Udaipur", 
      stars: 4, 
      basePrice: 9000,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Radisson Blu Udaipur", 
      stars: 4, 
      basePrice: 8000,
      amenities: ["WiFi", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hotel Lakend", 
      stars: 3, 
      basePrice: 5000,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
  ],
  "Kochi": [
    { 
      name: "Taj Malabar Resort & Spa", 
      stars: 5, 
      basePrice: 12000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Crowne Plaza Kochi", 
      stars: 5, 
      basePrice: 10000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Grand Hyatt Kochi", 
      stars: 5, 
      basePrice: 13000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Le Meridien Kochi", 
      stars: 4, 
      basePrice: 8500,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Radisson Blu Kochi", 
      stars: 4, 
      basePrice: 7500,
      amenities: ["WiFi", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hotel Abad Plaza", 
      stars: 3, 
      basePrice: 4500,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
  ],
  "Amritsar": [
    { 
      name: "Taj Swarna", 
      stars: 5, 
      basePrice: 10000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hyatt Regency Amritsar", 
      stars: 5, 
      basePrice: 11000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Radisson Blu Amritsar", 
      stars: 4, 
      basePrice: 7000,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Holiday Inn Amritsar", 
      stars: 4, 
      basePrice: 6500,
      amenities: ["WiFi", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hotel Sawera Grand", 
      stars: 3, 
      basePrice: 4000,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hotel CJ International", 
      stars: 3, 
      basePrice: 3500,
      amenities: ["WiFi"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
  ],
  "Varanasi": [
    { 
      name: "Taj Ganges", 
      stars: 5, 
      basePrice: 10000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Radisson Hotel Varanasi", 
      stars: 5, 
      basePrice: 9000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hotel Surya", 
      stars: 4, 
      basePrice: 6500,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Rivatas by Ideal", 
      stars: 4, 
      basePrice: 7000,
      amenities: ["WiFi", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hotel Meraden Grand", 
      stars: 3, 
      basePrice: 4500,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hotel Ganges View", 
      stars: 3, 
      basePrice: 4000,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
  ],
  "Mysore": [
    { 
      name: "Lalitha Mahal Palace", 
      stars: 5, 
      basePrice: 12000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "The Windflower Resort", 
      stars: 5, 
      basePrice: 10000,
      amenities: ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Radisson Blu Mysore", 
      stars: 4, 
      basePrice: 7500,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Royal Orchid Metropole", 
      stars: 4, 
      basePrice: 7000,
      amenities: ["WiFi", "Gym", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hotel Sandesh The Prince", 
      stars: 3, 
      basePrice: 4500,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    { 
      name: "Hotel Pai Vista", 
      stars: 3, 
      basePrice: 4000,
      amenities: ["WiFi", "Restaurant"],
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
  ],
};

const amenityIcons = {
  WiFi: Wifi,
  Pool: Waves,
  Gym: Dumbbell,
  Spa: Sparkles,
  Restaurant: Utensils,
};

const cabTypes = [
  { type: "Mini", basePrice: 10, capacity: 4 },
  { type: "Sedan", basePrice: 15, capacity: 4 },
  { type: "SUV", basePrice: 20, capacity: 6 },
  { type: "Luxury", basePrice: 35, capacity: 4 },
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
  
  const filteredHotels = selectedCity 
    ? hotelOptions[selectedCity].filter(hotel => 
        selectedAmenities.length === 0 || 
        selectedAmenities.every(amenity => hotel.amenities.includes(amenity))
      )
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
    const cab = cabTypes.find(c => c.type === formData.cabType) || cabTypes[0];
    const distance = parseInt(formData.distance) || 10;
    const baseFare = cab.basePrice * distance;
    const taxes = Math.round(baseFare * 0.05);
    return { fare: baseFare, taxes, total: baseFare + taxes, cab };
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
                          {filteredHotels.map((hotel) => (
                            <Card 
                              key={hotel.name}
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                formData.hotel === hotel.name ? 'ring-2 ring-primary' : ''
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
                                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
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
                      <Label htmlFor="cabType">Cab Type *</Label>
                      <Select value={formData.cabType} onValueChange={(value) => setFormData({ ...formData, cabType: value })}>
                        <SelectTrigger id="cabType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {cabTypes.map((cab) => (
                            <SelectItem key={cab.type} value={cab.type}>
                              {cab.type} - ₹{cab.basePrice}/km (Capacity: {cab.capacity})
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
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Real-time from Amadeus
                      </Badge>
                    </div>
                    <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
                      {realHotels.map((hotel) => (
                        <Card 
                          key={hotel.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedRealHotel?.id === hotel.id ? 'ring-2 ring-primary' : ''
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
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                  {hotel.currency} {hotel.price.toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">{hotel.roomType}</p>
                                {hotel.isRealBooking && (
                                  <Badge className="mt-1 bg-green-500">Live</Badge>
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
                      ))}
                    </div>
                  </div>
                )}

                {/* Real Flight Results */}
                {bookingType === "flight" && showRealResults && realFlights.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">Live Flight Results ({realFlights.length})</Label>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Real-time from Amadeus
                      </Badge>
                    </div>
                    <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
                      {realFlights.map((flight) => (
                        <Card 
                          key={flight.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedRealFlight?.id === flight.id ? 'ring-2 ring-primary' : ''
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
                                  <Badge className="mt-1 bg-green-500">Live</Badge>
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
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="guests">
                    <Users className="h-4 w-4 inline mr-1" />
                    Number of {bookingType === "hotel" ? "Guests" : "Passengers"}
                  </Label>
                  <Select value={formData.guests} onValueChange={(value) => setFormData({ ...formData, guests: value })}>
                    <SelectTrigger id="guests">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? (bookingType === "hotel" ? "Guest" : "Passenger") : (bookingType === "hotel" ? "Guests" : "Passengers")}
                        </SelectItem>
                      ))}
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
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center animate-scale-in">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
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
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm text-center">
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