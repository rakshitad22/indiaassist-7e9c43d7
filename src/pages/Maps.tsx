import { useState } from "react";
import { MapPin, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InteractiveBackground from "@/components/InteractiveBackground";

// Comprehensive list of Indian cities and tourist places
const allIndianPlaces = {
  // North India
  Delhi: [
    "Red Fort",
    "Qutub Minar",
    "India Gate",
    "Lotus Temple",
    "Humayun's Tomb",
    "Akshardham Temple",
    "Jama Masjid",
    "Chandni Chowk",
    "Raj Ghat",
    "Lodhi Gardens",
  ],
  Agra: [
    "Taj Mahal",
    "Agra Fort",
    "Fatehpur Sikri",
    "Mehtab Bagh",
    "Tomb of Itimad-ud-Daulah",
    "Jama Masjid",
    "Akbar's Tomb",
  ],
  Jaipur: [
    "Amber Fort",
    "Hawa Mahal",
    "City Palace",
    "Jantar Mantar",
    "Jal Mahal",
    "Nahargarh Fort",
    "Albert Hall Museum",
  ],
  Udaipur: [
    "City Palace",
    "Lake Pichola",
    "Jag Mandir",
    "Sajjangarh Palace",
    "Fateh Sagar Lake",
    "Jagdish Temple",
    "Saheliyon Ki Bari",
  ],
  Jodhpur: [
    "Mehrangarh Fort",
    "Umaid Bhawan Palace",
    "Jaswant Thada",
    "Clock Tower",
    "Mandore Gardens",
  ],
  Jaisalmer: [
    "Jaisalmer Fort",
    "Sam Sand Dunes",
    "Patwon Ki Haveli",
    "Gadisar Lake",
    "Bada Bagh",
  ],
  Amritsar: [
    "Golden Temple",
    "Wagah Border",
    "Jallianwala Bagh",
    "Partition Museum",
    "Akal Takht",
  ],
  Shimla: [
    "The Mall Road",
    "Jakhu Temple",
    "Christ Church",
    "Kufri",
    "Summer Hill",
    "Scandal Point",
  ],
  Manali: [
    "Rohtang Pass",
    "Solang Valley",
    "Hadimba Temple",
    "Manu Temple",
    "Old Manali",
    "Vashisht Hot Springs",
  ],
  Dharamshala: [
    "Dalai Lama Temple",
    "Bhagsu Waterfall",
    "McLeod Ganj",
    "Triund Trek",
    "Namgyal Monastery",
  ],
  Rishikesh: [
    "Laxman Jhula",
    "Ram Jhula",
    "Beatles Ashram",
    "Triveni Ghat",
    "Neer Garh Waterfall",
  ],
  Haridwar: [
    "Har Ki Pauri",
    "Mansa Devi Temple",
    "Chandi Devi Temple",
    "Ganga Aarti",
    "Maya Devi Temple",
  ],
  Varanasi: [
    "Dashashwamedh Ghat",
    "Kashi Vishwanath Temple",
    "Sarnath",
    "Assi Ghat",
    "Ramnagar Fort",
    "Manikarnika Ghat",
  ],
  Lucknow: [
    "Bara Imambara",
    "Chota Imambara",
    "Rumi Darwaza",
    "British Residency",
    "Hazratganj",
  ],
  Chandigarh: [
    "Rock Garden",
    "Sukhna Lake",
    "Rose Garden",
    "Capitol Complex",
    "Leisure Valley",
  ],
  // West India
  Mumbai: [
    "Gateway of India",
    "Marine Drive",
    "Elephanta Caves",
    "Chhatrapati Shivaji Terminus",
    "Siddhivinayak Temple",
    "Haji Ali Dargah",
    "Juhu Beach",
    "Colaba Causeway",
  ],
  Pune: [
    "Shaniwar Wada",
    "Aga Khan Palace",
    "Sinhagad Fort",
    "Osho Ashram",
    "Raja Dinkar Kelkar Museum",
  ],
  Aurangabad: [
    "Ajanta Caves",
    "Ellora Caves",
    "Bibi Ka Maqbara",
    "Daulatabad Fort",
    "Grishneshwar Temple",
  ],
  Goa: [
    "Baga Beach",
    "Calangute Beach",
    "Fort Aguada",
    "Basilica of Bom Jesus",
    "Dudhsagar Falls",
    "Anjuna Beach",
    "Chapora Fort",
    "Palolem Beach",
  ],
  Ahmedabad: [
    "Sabarmati Ashram",
    "Adalaj Stepwell",
    "Akshardham Temple",
    "Kankaria Lake",
    "Sidi Saiyyed Mosque",
  ],
  Surat: [
    "Dumas Beach",
    "Sarthana Nature Park",
    "Dutch Garden",
    "Surat Castle",
    "Gopi Talav",
  ],
  Nashik: [
    "Sula Vineyards",
    "Trimbakeshwar Temple",
    "Pandavleni Caves",
    "Gangapur Dam",
    "Kalaram Temple",
  ],
  // South India
  Bangalore: [
    "Lalbagh Botanical Garden",
    "Cubbon Park",
    "Bangalore Palace",
    "ISKCON Temple",
    "Tipu Sultan's Palace",
    "Nandi Hills",
  ],
  Mysore: [
    "Mysore Palace",
    "Chamundi Hills",
    "Brindavan Gardens",
    "St. Philomena's Cathedral",
    "Mysore Zoo",
  ],
  Chennai: [
    "Marina Beach",
    "Kapaleeshwarar Temple",
    "Fort St. George",
    "Mahabalipuram",
    "San Thome Cathedral",
  ],
  Kochi: [
    "Fort Kochi",
    "Chinese Fishing Nets",
    "Mattancherry Palace",
    "Jewish Synagogue",
    "Marine Drive",
  ],
  "Kerala Backwaters": [
    "Alleppey Backwaters",
    "Munnar Tea Gardens",
    "Periyar Wildlife Sanctuary",
    "Kovalam Beach",
    "Varkala Beach",
    "Athirapally Falls",
  ],
  Hyderabad: [
    "Charminar",
    "Golconda Fort",
    "Ramoji Film City",
    "Hussain Sagar Lake",
    "Salar Jung Museum",
    "Chowmahalla Palace",
  ],
  Visakhapatnam: [
    "RK Beach",
    "Araku Valley",
    "Borra Caves",
    "Kailasagiri",
    "Submarine Museum",
  ],
  Hampi: [
    "Virupaksha Temple",
    "Vittala Temple",
    "Stone Chariot",
    "Lotus Mahal",
    "Elephant Stables",
  ],
  Coorg: [
    "Abbey Falls",
    "Raja's Seat",
    "Dubare Elephant Camp",
    "Talacauvery",
    "Madikeri Fort",
  ],
  Ooty: [
    "Ooty Lake",
    "Botanical Gardens",
    "Doddabetta Peak",
    "Nilgiri Mountain Railway",
    "Rose Garden",
  ],
  Pondicherry: [
    "Promenade Beach",
    "Auroville",
    "Sri Aurobindo Ashram",
    "Paradise Beach",
    "French Quarter",
  ],
  Madurai: [
    "Meenakshi Temple",
    "Thirumalai Nayakkar Palace",
    "Gandhi Memorial Museum",
    "Alagar Kovil",
    "Vandiyur Mariamman Teppakulam",
  ],
  Trivandrum: [
    "Padmanabhaswamy Temple",
    "Kovalam Beach",
    "Napier Museum",
    "Shanghumukham Beach",
    "Poovar Island",
  ],
  // East India
  Kolkata: [
    "Victoria Memorial",
    "Howrah Bridge",
    "Dakshineswar Temple",
    "Indian Museum",
    "Marble Palace",
    "Science City",
  ],
  Darjeeling: [
    "Tiger Hill",
    "Darjeeling Himalayan Railway",
    "Batasia Loop",
    "Japanese Peace Pagoda",
    "Happy Valley Tea Estate",
  ],
  Gangtok: [
    "Tsomgo Lake",
    "Rumtek Monastery",
    "MG Marg",
    "Nathula Pass",
    "Banjhakri Falls",
  ],
  Puri: [
    "Jagannath Temple",
    "Puri Beach",
    "Konark Sun Temple",
    "Chilika Lake",
    "Raghurajpur Village",
  ],
  Bhubaneswar: [
    "Lingaraj Temple",
    "Udayagiri Caves",
    "Nandankanan Zoo",
    "Dhauli Hill",
    "Odisha State Museum",
  ],
  Kaziranga: [
    "Kaziranga National Park",
    "Elephant Safari",
    "Jeep Safari",
    "Orchid Park",
  ],
  Shillong: [
    "Umiam Lake",
    "Elephant Falls",
    "Shillong Peak",
    "Don Bosco Museum",
    "Ward's Lake",
  ],
  Guwahati: [
    "Kamakhya Temple",
    "Brahmaputra River Cruise",
    "Umananda Island",
    "Assam State Museum",
    "Pobitora Wildlife Sanctuary",
  ],
  Imphal: [
    "Kangla Fort",
    "Loktak Lake",
    "Ima Keithel",
    "Shri Govindajee Temple",
    "War Cemetery",
  ],
  // Central India
  Bhopal: [
    "Upper Lake",
    "Taj-ul-Masajid",
    "Bhimbetka Caves",
    "Van Vihar National Park",
    "Sanchi Stupa",
  ],
  Khajuraho: [
    "Khajuraho Temples",
    "Kandariya Mahadev Temple",
    "Lakshmana Temple",
    "Light & Sound Show",
  ],
  Indore: [
    "Rajwada Palace",
    "Lal Bagh Palace",
    "Sarafa Bazaar",
    "Patalpani Waterfall",
    "Mandu Fort",
  ],
  Gwalior: [
    "Gwalior Fort",
    "Jai Vilas Palace",
    "Sas Bahu Temple",
    "Teli Ka Mandir",
    "Sun Temple",
  ],
  Ujjain: [
    "Mahakaleshwar Temple",
    "Ram Ghat",
    "Kal Bhairav Temple",
    "Vedh Shala Observatory",
    "Sandipani Ashram",
  ],
  Jabalpur: [
    "Dhuandhar Falls",
    "Bhedaghat Marble Rocks",
    "Madan Mahal Fort",
    "Rani Durgavati Museum",
    "Chausath Yogini Temple",
  ],
  Raipur: [
    "Mahant Ghasidas Museum",
    "Nandan Van Zoo",
    "Marine Drive",
    "Vivekananda Sarovar",
    "Champaran",
  ],
  Ranchi: [
    "Hundru Falls",
    "Rock Garden",
    "Tagore Hill",
    "Jagannath Temple",
    "Patratu Valley",
  ],
  Patna: [
    "Golghar",
    "Patna Museum",
    "Mahavir Mandir",
    "Gandhi Maidan",
    "Kumhrar Archaeological Site",
  ],
};

const Maps = () => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const cities = Object.keys(allIndianPlaces);

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const places = selectedCity ? allIndianPlaces[selectedCity as keyof typeof allIndianPlaces] : [];

  return (
    <div className="min-h-screen relative">
      <InteractiveBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-gradient">
              Explore India
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Click on any city to discover its famous tourist destinations
            </p>

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
          </div>

          {/* Selected City Details */}
          {selectedCity && (
            <Card className="mb-8 shadow-lg-custom">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <MapPin className="h-6 w-6 text-primary" />
                      {selectedCity}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Top Tourist Attractions
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCity(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {places.map((place, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPlace(place)}
                      className={`p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border transition-smooth text-left w-full ${
                        selectedPlace === place
                          ? "border-primary shadow-card"
                          : "border-border hover:shadow-card hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          selectedPlace === place
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary"
                        }`}>
                          {index + 1}
                        </div>
                        <p className="font-medium">{place}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Embedded Google Map */}
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    title={`Map of ${selectedPlace || selectedCity}`}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                      selectedPlace 
                        ? `${selectedPlace}, ${selectedCity}, India` 
                        : `${selectedCity}, India`
                    )}&zoom=${selectedPlace ? 15 : 12}`}
                  />
                </div>
              </CardContent>
            </Card>
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
              <p className="text-muted-foreground">No cities found matching your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Maps;
