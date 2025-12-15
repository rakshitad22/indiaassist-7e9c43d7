import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, MessageCircle, Phone, Landmark, Plane, Shield } from "lucide-react";
import InteractiveBackground from "@/components/InteractiveBackground";
import WeatherWidget from "@/components/WeatherWidget";
import NearbyPlacesWidget from "@/components/NearbyPlacesWidget";

const Home = () => {
  const features = [
    {
      icon: <Landmark className="h-8 w-8" />,
      title: "Top Destinations",
      description: "Explore iconic landmarks and hidden gems across India",
      link: "/destinations",
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "AI Travel Buddy",
      description: "Get instant help and recommendations 24/7",
      link: "/chat",
    },
    {
      icon: <Phone className="h-8 w-8" />,
      title: "Emergency Support",
      description: "Quick access to emergency contacts and embassy info",
      link: "/emergency",
    },
  ];

  return (
    <div className="min-h-screen relative">
      <InteractiveBackground />
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 gradient-hero">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200')] bg-cover bg-center opacity-20"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Welcome to India Assist
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
            Your Smart Travel Companion for an Incredible India Journey
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <Link to="/destinations">
              <Button size="lg" variant="secondary" className="gap-2">
                <MapPin className="h-5 w-5" />
                Explore Destinations
              </Button>
            </Link>
            <Link to="/chat">
              <Button size="lg" className="gap-2 bg-saffron hover:bg-saffron/90">
                <MessageCircle className="h-5 w-5" />
                Chat with Travel Buddy
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About India */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Discover Incredible India</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              India is a land of diverse cultures, ancient heritage, breathtaking landscapes, 
              and warm hospitality. From the majestic Taj Mahal to the serene backwaters of Kerala, 
              from bustling Delhi to the spiritual Varanasi, India offers experiences that will 
              touch your soul and create memories that last forever.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">5000+</div>
                <div className="text-muted-foreground">Years of History</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-saffron mb-2">28</div>
                <div className="text-muted-foreground">States & Cultures</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">40+</div>
                <div className="text-muted-foreground">UNESCO Sites</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How We Help You</h2>
          
          {/* Weather and Nearby Places Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            <WeatherWidget />
            <NearbyPlacesWidget />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link}>
                <Card className="h-full hover:shadow-lg-custom transition-smooth cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="text-primary group-hover:text-saffron transition-smooth mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Info */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Travel Safe, Travel Smart</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-2">General Safety</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Keep copies of important documents</li>
                    <li>• Stay aware of your surroundings</li>
                    <li>• Use registered taxis and transportation</li>
                    <li>• Drink bottled water</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-2">Cultural Respect</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Dress modestly at religious sites</li>
                    <li>• Remove shoes before entering temples</li>
                    <li>• Ask permission before taking photos</li>
                    <li>• Respect local customs and traditions</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-saffron">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Let India Assist be your guide to an unforgettable Indian adventure
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/bookings">
              <Button size="lg" variant="secondary">
                Book Your Trip
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
