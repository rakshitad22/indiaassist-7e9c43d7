import { Navigation, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Place, categoryIcons } from "@/data/indianPlaces";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PlaceCardProps {
  place: Place;
  index: number;
  city: string;
  isSelected: boolean;
  onSelect: () => void;
}

const PlaceCard = ({ place, index, city, isSelected, onSelect }: PlaceCardProps) => {
  const handleGetDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${place.name}, ${city}, India`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, "_blank");
  };

  const handleShareWhatsApp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const phoneNumber = prompt("Enter WhatsApp number (with country code, e.g., 919876543210):");
    if (!phoneNumber) return;

    try {
      const { data, error } = await supabase.functions.invoke("send-booking-whatsapp", {
        body: {
          phoneNumber,
          bookingType: "cab",
          bookingDetails: {
            origin: "Your Location",
            destination: `${place.name}, ${city}`,
            departureDate: new Date().toLocaleDateString(),
            price: "View on Maps",
            bookingId: `PLACE-${Date.now()}`,
          },
        },
      });

      if (error) throw error;
      toast.success(`Place details sent to WhatsApp: ${phoneNumber}`);
    } catch (error: any) {
      console.error("WhatsApp error:", error);
      toast.error("Failed to send WhatsApp message. Please try again.");
    }
  };

  return (
    <button
      onClick={onSelect}
      className={`p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border transition-smooth text-left w-full ${
        isSelected
          ? "border-primary shadow-card"
          : "border-border hover:shadow-card hover:border-primary/50"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary"
          }`}
        >
          {index + 1}
        </div>
        <div className="flex-1">
          <p className="font-medium">{place.name}</p>
          <span className="text-xs text-muted-foreground">
            {categoryIcons[place.category]} {place.category}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs"
          onClick={handleGetDirections}
        >
          <Navigation className="h-3 w-3 mr-1" />
          Directions
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs"
          onClick={handleShareWhatsApp}
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          WhatsApp
        </Button>
      </div>
    </button>
  );
};

export default PlaceCard;
