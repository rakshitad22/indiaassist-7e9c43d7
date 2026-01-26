import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import InteractiveBackground from "@/components/InteractiveBackground";
import ThemeToggle from "@/components/maps/ThemeToggle";
import CategoryFilter from "@/components/maps/CategoryFilter";
import CityDetails from "@/components/maps/CityDetails";
import { allIndianPlaces, PlaceCategory } from "@/data/indianPlaces";

const Maps = () => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<PlaceCategory[]>([]);
  const [mapMode, setMapMode] = useState<"lite" | "standard">("standard");

  const cities = Object.keys(allIndianPlaces);

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const places = selectedCity ? allIndianPlaces[selectedCity] : [];

  const handleToggleCategory = (category: PlaceCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="min-h-screen relative">
      <InteractiveBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header with Theme Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-bold mb-2 text-gradient">
                Explore India
              </h1>
              <p className="text-muted-foreground">
                Click on any city to discover its famous tourist destinations
              </p>
            </div>
            <ThemeToggle />
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-6">
            <Input
              type="text"
              placeholder="Search for a city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Category Filters */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Filter by category:
            </p>
            <CategoryFilter
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
            />
          </div>

          {/* Map Mode Toggle */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Label htmlFor="map-mode" className="text-sm text-muted-foreground">
              Standard Map
            </Label>
            <Switch
              id="map-mode"
              checked={mapMode === "lite"}
              onCheckedChange={(checked) =>
                setMapMode(checked ? "lite" : "standard")
              }
            />
            <Label htmlFor="map-mode" className="text-sm text-muted-foreground">
              Lite Mode
            </Label>
          </div>

          {/* Selected City Details */}
          {selectedCity && (
            <CityDetails
              city={selectedCity}
              places={places}
              selectedPlace={selectedPlace}
              selectedCategories={selectedCategories}
              onSelectPlace={setSelectedPlace}
              onClose={() => setSelectedCity(null)}
              mapMode={mapMode}
            />
          )}

          {/* Cities Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredCities.map((city) => (
              <Button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  setSelectedPlace(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                variant={selectedCity === city ? "default" : "outline"}
                className="h-auto py-4 flex flex-col items-center gap-2 transition-smooth hover:scale-105"
              >
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-medium">{city}</span>
              </Button>
            ))}
          </div>

          {filteredCities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No cities found matching your search
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Maps;
