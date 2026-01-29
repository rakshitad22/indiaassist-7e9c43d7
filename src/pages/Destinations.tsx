import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Utensils, Hotel, Eye, Star } from "lucide-react";
import DestinationDetails from "@/components/DestinationDetails";

interface Destination {
  name: string;
  location: string;
  description: string;
  image: string;
  attractions: string[];
  mapEmbed: string;
  nearby: string[];
  rating: number; // Added rating field
}

const Destinations = () => {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const destinations: Destination[] = [
    {
      name: "Mumbai",
      location: "Maharashtra",
      description: "India's financial capital, Mumbai is a vibrant metropolis known for Bollywood, colonial architecture, and bustling street markets.",
      image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800",
      attractions: ["Gateway of India", "Marine Drive", "Elephanta Caves", "Chhatrapati Shivaji Terminus", "Haji Ali Dargah"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d242647.5!2d72.7479!3d19.0760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["Taj Mahal Palace", "Trishna Restaurant", "Leopold Cafe"],
      rating: 4.7,
    },
    {
      name: "Delhi",
      location: "National Capital Territory",
      description: "India's capital is a perfect blend of ancient history and modern urban life, with magnificent monuments and bustling markets.",
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
      attractions: ["Red Fort", "India Gate", "Qutub Minar", "Humayun's Tomb", "Lotus Temple", "Akshardham Temple"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d448193.95089227824!2d76.82493254633897!3d28.643917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["The Imperial", "Karim's Restaurant", "Indian Accent"],
      rating: 4.5,
    },
    {
      name: "Bangalore",
      location: "Karnataka",
      description: "India's Silicon Valley is a cosmopolitan city known for its IT industry, pleasant weather, parks, and vibrant food scene.",
      image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800",
      attractions: ["Lalbagh Botanical Garden", "Bangalore Palace", "Cubbon Park", "Vidhana Soudha", "ISKCON Temple"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d497511.2!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["The Oberoi", "Toit", "Vidyarthi Bhavan"],
      rating: 4.4,
    },
    {
      name: "Goa",
      location: "Goa",
      description: "India's beach paradise offers pristine beaches, Portuguese architecture, vibrant nightlife, and delicious seafood.",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
      attractions: ["Baga Beach", "Fort Aguada", "Basilica of Bom Jesus", "Dudhsagar Falls", "Calangute Beach", "Anjuna Flea Market"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d492531.64406990346!2d73.6965363!3d15.3004543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbfba106336b741%3A0xeaf887ff62f34092!2sGoa!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["Taj Exotica", "Fisherman's Wharf", "Britto's"],
      rating: 4.8,
    },
    {
      name: "Jaipur",
      location: "Rajasthan",
      description: "The Pink City is famous for its stunning palaces, vibrant bazaars, and rich Rajasthani culture and heritage.",
      image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
      attractions: ["Hawa Mahal", "Amber Fort", "City Palace", "Jantar Mantar", "Nahargarh Fort", "Jal Mahal"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d227748.99973182375!2d75.65046970298878!3d26.88512409857505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c4adf4c57e281%3A0xce1c63a0cf22e09!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["Rambagh Palace", "LMB Restaurant", "Rawat Mishthan Bhandar"],
      rating: 4.6,
    },
    {
      name: "Agra",
      location: "Uttar Pradesh",
      description: "Home to the magnificent Taj Mahal, one of the Seven Wonders of the World, Agra is a city steeped in Mughal history and architectural splendor.",
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800",
      attractions: ["Taj Mahal", "Agra Fort", "Mehtab Bagh", "Tomb of Itimad-ud-Daulah", "Fatehpur Sikri"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3549.4830611394967!2d78.03980731504216!3d27.175014982874694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39747121d702ff6d%3A0xdd2ae4803f767dde!2sAgra!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["The Oberoi Amarvilas", "Pinch of Spice Restaurant", "Dasaprakash Restaurant"],
      rating: 4.9,
    },
    {
      name: "Kerala Backwaters",
      location: "Kerala",
      description: "Experience the serene beauty of palm-fringed waterways, traditional houseboats, and lush green landscapes in God's Own Country.",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
      attractions: ["Alleppey Backwaters", "Kumarakom Bird Sanctuary", "Vembanad Lake", "Traditional Houseboats"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d251507.36589474813!2d76.22897494033142!3d9.498066532991733!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d514abec6bf%3A0xbd582caa5844192!2sKerala!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["Vivanta by Taj", "Kerala Cafe", "Thaff Restaurant"],
      rating: 4.8,
    },
    {
      name: "Varanasi",
      location: "Uttar Pradesh",
      description: "The spiritual heart of India, Varanasi offers ancient temples, mesmerizing Ganga Aarti ceremonies, and profound cultural experiences.",
      image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800",
      attractions: ["Kashi Vishwanath Temple", "Dashashwamedh Ghat", "Sarnath", "Assi Ghat", "Manikarnika Ghat"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57667.95579732916!2d82.9550395!3d25.3356491!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e2db76febcf4d%3A0x68131710853ff0b5!2sVaranasi%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["Taj Ganges", "Keshari Ruchikar Bhojnalaya", "Brown Bread Bakery"],
      rating: 4.7,
    },
    {
      name: "Udaipur",
      location: "Rajasthan",
      description: "The City of Lakes captivates visitors with its romantic palaces, serene lakes, and colorful bazaars.",
      image: "https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=800",
      attractions: ["City Palace", "Lake Pichola", "Jag Mandir", "Saheliyon Ki Bari", "Fateh Sagar Lake"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115313.88228478!2d73.6238!3d24.5854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3967e56a0f0e0c19%3A0xa5c8c0f8c2e0c5f!2sUdaipur!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["Taj Lake Palace", "Ambrai Restaurant", "Upre"],
      rating: 4.8,
    },
    {
      name: "Rishikesh",
      location: "Uttarakhand",
      description: "Known as the Yoga Capital of the World, Rishikesh offers spiritual retreats, adventure sports, and scenic Himalayan views.",
      image: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800",
      attractions: ["Laxman Jhula", "Ram Jhula", "Triveni Ghat", "Beatles Ashram", "Neer Garh Waterfall"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27465.284!2d78.2676!3d30.0869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39093e67cf93f111%3A0xcc78e2b91b6e0c8a!2sRishikesh!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["Ananda in the Himalayas", "The Sitting Elephant", "Little Buddha Cafe"],
      rating: 4.6,
    },
    {
      name: "Hampi",
      location: "Karnataka",
      description: "Ancient ruins, magnificent temples, and boulder-strewn landscapes make Hampi a UNESCO World Heritage Site of extraordinary beauty.",
      image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
      attractions: ["Virupaksha Temple", "Vittala Temple", "Hampi Bazaar", "Matanga Hill", "Lotus Mahal"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61851.9!2d76.4709!3d15.3350!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb77fd95b2bce11%3A0x45787573c5864e9a!2sHampi!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["Evolve Back", "Mango Tree Restaurant", "Laughing Buddha"],
      rating: 4.7,
    },
    {
      name: "Ladakh",
      location: "Jammu & Kashmir",
      description: "Experience the stark beauty of high-altitude deserts, ancient monasteries, and pristine mountain lakes in the Land of High Passes.",
      image: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=800",
      attractions: ["Pangong Lake", "Nubra Valley", "Thiksey Monastery", "Khardung La Pass", "Leh Palace"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d210244.6!2d77.5771!3d34.1526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38fdea3a8f07d771%3A0x2f5bcce96c5ff66!2sLadakh!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["The Grand Dragon", "Gesmo Restaurant", "Bon Appetit"],
      rating: 4.9,
    },
    {
      name: "Amritsar",
      location: "Punjab",
      description: "Home to the iconic Golden Temple, Amritsar offers rich Sikh heritage, delicious Punjabi cuisine, and historic landmarks.",
      image: "https://images.unsplash.com/photo-1604608167384-1f1cebe47a0e?w=800",
      attractions: ["Golden Temple", "Jallianwala Bagh", "Wagah Border", "Partition Museum", "Durgiana Temple"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d107992.3!2d74.8723!3d31.6340!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391964aa569e7355%3A0xeea2605bee84a2dd!2sAmritsar!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["Taj Swarna", "Kesar Da Dhaba", "Bharawan Da Dhaba"],
      rating: 4.8,
    },
    {
      name: "Mysore",
      location: "Karnataka",
      description: "Known for its royal heritage, magnificent palaces, and aromatic sandalwood, Mysore is a cultural treasure of South India.",
      image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
      attractions: ["Mysore Palace", "Chamundi Hills", "Brindavan Gardens", "St. Philomena's Church", "Mysore Zoo"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124447.5!2d76.6394!3d12.2958!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baf70381d572ef9%3A0x2b89ece8c0f8396d!2sMysore!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["Lalitha Mahal Palace", "RRR Restaurant", "Mylari Hotel"],
      rating: 4.5,
    },
    {
      name: "Shimla",
      location: "Himachal Pradesh",
      description: "The Queen of Hill Stations offers colonial architecture, scenic mountain views, and pleasant climate year-round.",
      image: "https://images.unsplash.com/photo-1562503542-2a1e6f03b16b?w=800",
      attractions: ["The Ridge", "Mall Road", "Jakhoo Temple", "Christ Church", "Kufri"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54790.4!2d77.1734!3d31.1048!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39057e5996c2d5b9%3A0x8d2b6afcde7c961!2sShimla!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["Wildflower Hall", "Ashiana Restaurant", "Cafe Simla Times"],
      rating: 4.4,
    },
    {
      name: "Darjeeling",
      location: "West Bengal",
      description: "Famous for its tea gardens, toy train, and stunning views of Kanchenjunga, Darjeeling is the Queen of the Himalayas.",
      image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
      attractions: ["Tiger Hill", "Darjeeling Himalayan Railway", "Batasia Loop", "Peace Pagoda", "Tea Gardens"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28439.5!2d88.2663!3d27.0410!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e6a56a1e85f441%3A0x44179364c50bad7!2sDarjeeling!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["Windamere Hotel", "Glenary's", "Keventers"],
      rating: 4.6,
    },
    {
      name: "Khajuraho",
      location: "Madhya Pradesh",
      description: "Marvel at the exquisite temple architecture featuring intricate sculptures that showcase ancient Indian art and culture.",
      image: "https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=800",
      attractions: ["Western Group of Temples", "Eastern Group of Temples", "Kandariya Mahadev Temple", "Light & Sound Show"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29424.7!2d79.9199!3d24.8318!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3982ef35e3e3e3e3%3A0x3e3e3e3e3e3e3e3e!2sKhajuraho!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["Radisson Jass", "Raja Cafe", "Mediterraneo"],
      rating: 4.5,
    },
    {
      name: "Ooty",
      location: "Tamil Nadu",
      description: "The Queen of Hill Stations in the Nilgiris offers lush tea gardens, botanical gardens, and scenic mountain railways.",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
      attractions: ["Ooty Lake", "Botanical Gardens", "Doddabetta Peak", "Nilgiri Mountain Railway", "Rose Garden"],
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125019.2!2d76.6950!3d11.4102!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8bd5f6c0c6c9b%3A0xb6b8e4b8e4b8e4b8!2sOoty!5e0!3m2!1sen!2sin!4v1234567890",
      nearby: ["Savoy Hotel", "Earl's Secret", "Nahar Restaurant"],
      rating: 4.5,
    },
  ];

  const handleViewDetails = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Explore India's Top Destinations</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the most iconic and breathtaking places across Incredible India. Click on any destination for complete details!
          </p>
        </div>

        <div className="space-y-12">
          {destinations.map((destination, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.01, y: -4 }}
            >
              <Card className="overflow-hidden shadow-card hover:shadow-lg-custom transition-all duration-300 hover:border-primary/30">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image */}
                  <div className="h-64 md:h-auto relative overflow-hidden group">
                    <motion.img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-saffron text-white">
                        <MapPin className="h-3 w-3 mr-1" />
                        {destination.location}
                      </Badge>
                    </div>
                  </div>

                {/* Content */}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-3xl font-bold">{destination.name}</h2>
                    <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
                      <Star className="h-4 w-4 fill-golden text-golden" />
                      <span className="font-semibold text-sm">{destination.rating}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6">{destination.description}</p>

                  {/* Attractions */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Top Attractions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {destination.attractions.slice(0, 4).map((attraction, i) => (
                        <Badge key={i} variant="secondary">
                          {attraction}
                        </Badge>
                      ))}
                      {destination.attractions.length > 4 && (
                        <Badge variant="outline">+{destination.attractions.length - 4} more</Badge>
                      )}
                    </div>
                  </div>

                  {/* Nearby */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-primary" />
                      Nearby Restaurants & Hotels
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {destination.nearby.slice(0, 2).map((place, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Hotel className="h-3 w-3" />
                          {place}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* View Details Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => handleViewDetails(destination)}
                      className="w-full md:w-auto transition-all duration-300 hover:shadow-md"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Complete Details
                    </Button>
                  </motion.div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
          ))}
        </div>
      </div>

      {/* Destination Details Modal */}
      <DestinationDetails 
        destination={selectedDestination}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default Destinations;
