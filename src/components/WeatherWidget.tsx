import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, CloudRain, Sun, Wind } from "lucide-react";

const cities = [
  { name: "Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Goa", lat: 15.2993, lon: 74.124 },
];

interface WeatherData {
  temp: number;
  feels_like: number;
  description: string;
  humidity: number;
  wind_speed: number;
  icon: string;
}

const WeatherWidget = () => {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeather();
  }, [selectedCity]);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      // Using Open-Meteo API (free, no API key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=celsius&wind_speed_unit=kmh`
      );
      const data = await response.json();

      if (data.current) {
        const weatherCode = data.current.weather_code;
        const description = getWeatherDescription(weatherCode);
        
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          feels_like: Math.round(data.current.temperature_2m - 2),
          description,
          humidity: data.current.relative_humidity_2m,
          wind_speed: Math.round(data.current.wind_speed_10m),
          icon: getWeatherIcon(weatherCode),
        });
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherDescription = (code: number): string => {
    if (code === 0) return "Clear sky";
    if (code <= 3) return "Partly cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    if (code <= 82) return "Rain showers";
    return "Stormy";
  };

  const getWeatherIcon = (code: number): string => {
    if (code === 0) return "sun";
    if (code <= 3) return "cloud";
    if (code <= 67) return "cloud-rain";
    return "cloud-rain";
  };

  const WeatherIcon = ({ icon }: { icon: string }) => {
    switch (icon) {
      case "sun":
        return <Sun className="h-12 w-12 text-amber-500" />;
      case "cloud":
        return <Cloud className="h-12 w-12 text-gray-400" />;
      case "cloud-rain":
        return <CloudRain className="h-12 w-12 text-blue-500" />;
      default:
        return <Sun className="h-12 w-12 text-amber-500" />;
    }
  };

  return (
    <Card className="shadow-lg-custom">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weather</span>
          <Select
            value={selectedCity.name}
            onValueChange={(value) => {
              const city = cities.find((c) => c.name === value);
              if (city) setSelectedCity(city);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.name} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : weather ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold">{weather.temp}°C</div>
                <div className="text-muted-foreground text-sm">Feels like {weather.feels_like}°C</div>
              </div>
              <WeatherIcon icon={weather.icon} />
            </div>
            <div className="text-lg capitalize">{weather.description}</div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Humidity</div>
                  <div className="font-semibold">{weather.humidity}%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Wind</div>
                  <div className="font-semibold">{weather.wind_speed} km/h</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">Unable to load weather data</div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;