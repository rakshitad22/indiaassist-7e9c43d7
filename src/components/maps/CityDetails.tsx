import { MapPin, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PlaceCard from "./PlaceCard";
import { Place, PlaceCategory } from "@/data/indianPlaces";

interface CityDetailsProps {
  city: string;
  places: Place[];
  selectedPlace: string | null;
  selectedCategories: PlaceCategory[];
  onSelectPlace: (place: string) => void;
  onClose: () => void;
  mapMode: "lite" | "standard";
}

const CityDetails = ({
  city,
  places,
  selectedPlace,
  selectedCategories,
  onSelectPlace,
  onClose,
  mapMode,
}: CityDetailsProps) => {
  const filteredPlaces =
    selectedCategories.length === 0
      ? places
      : places.filter((place) => selectedCategories.includes(place.category));

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
    selectedPlace ? `${selectedPlace}, ${city}, India` : `${city}, India`
  )}&zoom=${selectedPlace ? 15 : 12}${mapMode === "lite" ? "&maptype=roadmap" : ""}`;

  return (
    <Card className="mb-8 shadow-lg-custom">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              {city}
            </h2>
            <p className="text-muted-foreground mt-1">
              {filteredPlaces.length} attractions
              {selectedCategories.length > 0 && " (filtered)"}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {filteredPlaces.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No places match the selected categories
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {filteredPlaces.map((place, index) => (
              <PlaceCard
                key={place.name}
                place={place}
                index={index}
                city={city}
                isSelected={selectedPlace === place.name}
                onSelect={() => onSelectPlace(place.name)}
              />
            ))}
          </div>
        )}

        {/* Embedded Google Map */}
        <div className="rounded-lg overflow-hidden shadow-lg">
          <iframe
            title={`Map of ${selectedPlace || city}`}
            width="100%"
            height="400"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={mapUrl}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CityDetails;
