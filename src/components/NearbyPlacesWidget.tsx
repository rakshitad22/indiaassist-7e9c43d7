import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useNearbyNotifications } from '@/hooks/useNearbyNotifications';
import { 
  MapPin, 
  Bell, 
  BellOff, 
  Settings2, 
  Navigation, 
  Hotel, 
  Utensils, 
  Landmark,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const NearbyPlacesWidget = () => {
  const {
    nearbyPlaces,
    settings,
    updateSettings,
    requestPermission,
    permissionGranted,
    locationError,
    locationLoading,
    latitude,
    longitude,
    clearNotifiedPlaces,
  } = useNearbyNotifications();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getPlaceIcon = (type: string) => {
    switch (type) {
      case 'attraction':
        return <Landmark className="h-4 w-4" />;
      case 'restaurant':
        return <Utensils className="h-4 w-4" />;
      case 'hotel':
        return <Hotel className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Nearby Places
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={requestPermission}
              title={permissionGranted ? 'Notifications enabled' : 'Enable notifications'}
            >
              {permissionGranted ? (
                <Bell className="h-4 w-4 text-green-500" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Notification Settings</SheetTitle>
                  <SheetDescription>
                    Configure how you want to be notified about nearby places
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications-enabled">Enable Notifications</Label>
                    <Switch
                      id="notifications-enabled"
                      checked={settings.enabled}
                      onCheckedChange={(checked) => updateSettings({ enabled: checked })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Distance Range: {settings.distanceKm} km</Label>
                    <Slider
                      value={[settings.distanceKm]}
                      onValueChange={([value]) => updateSettings({ distanceKm: value })}
                      min={1}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Get notified for places within {settings.distanceKm} kilometers
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label>Notify me about:</Label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-primary" />
                        <span className="text-sm">Attractions</span>
                      </div>
                      <Switch
                        checked={settings.notifyAttractions}
                        onCheckedChange={(checked) => updateSettings({ notifyAttractions: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-primary" />
                        <span className="text-sm">Restaurants</span>
                      </div>
                      <Switch
                        checked={settings.notifyRestaurants}
                        onCheckedChange={(checked) => updateSettings({ notifyRestaurants: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hotel className="h-4 w-4 text-primary" />
                        <span className="text-sm">Hotels</span>
                      </div>
                      <Switch
                        checked={settings.notifyHotels}
                        onCheckedChange={(checked) => updateSettings({ notifyHotels: checked })}
                      />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearNotifiedPlaces}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Notification History
                  </Button>

                  {!permissionGranted && (
                    <Button
                      className="w-full"
                      onClick={requestPermission}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Enable Push Notifications
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {locationLoading && (
          <div className="flex items-center justify-center py-4 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Getting your location...
          </div>
        )}

        {locationError && (
          <div className="flex items-center gap-2 text-destructive py-4">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{locationError}</span>
          </div>
        )}

        {latitude && longitude && !locationError && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Your location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </div>

            {nearbyPlaces.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No places found within {settings.distanceKm} km. Try increasing the distance in settings.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {nearbyPlaces.slice(0, 5).map((place) => (
                  <div
                    key={place.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                        {getPlaceIcon(place.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{place.name}</p>
                        <p className="text-xs text-muted-foreground">{place.city}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {place.distance.toFixed(1)} km
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {nearbyPlaces.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                + {nearbyPlaces.length - 5} more places nearby
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NearbyPlacesWidget;
