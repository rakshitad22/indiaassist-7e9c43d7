import { useState, useEffect, useCallback } from 'react';
import { useGeolocation, calculateDistance } from './useGeolocation';
import { toast } from 'sonner';

interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  city: string;
  type: 'attraction' | 'restaurant' | 'hotel';
}

interface NearbyPlace extends Place {
  distance: number;
}

// Indian tourist places with coordinates
const INDIAN_PLACES: Place[] = [
  // Delhi
  { id: 'delhi-1', name: 'Red Fort', latitude: 28.6562, longitude: 77.2410, description: 'Historic Mughal fort', city: 'Delhi', type: 'attraction' },
  { id: 'delhi-2', name: 'India Gate', latitude: 28.6129, longitude: 77.2295, description: 'War memorial monument', city: 'Delhi', type: 'attraction' },
  { id: 'delhi-3', name: 'Qutub Minar', latitude: 28.5245, longitude: 77.1855, description: 'UNESCO World Heritage Site', city: 'Delhi', type: 'attraction' },
  { id: 'delhi-4', name: 'Lotus Temple', latitude: 28.5535, longitude: 77.2588, description: 'Bahai House of Worship', city: 'Delhi', type: 'attraction' },
  
  // Mumbai
  { id: 'mumbai-1', name: 'Gateway of India', latitude: 18.9220, longitude: 72.8347, description: 'Iconic arch monument', city: 'Mumbai', type: 'attraction' },
  { id: 'mumbai-2', name: 'Marine Drive', latitude: 18.9432, longitude: 72.8235, description: 'Scenic promenade', city: 'Mumbai', type: 'attraction' },
  { id: 'mumbai-3', name: 'Elephanta Caves', latitude: 18.9633, longitude: 72.9315, description: 'Ancient rock-cut caves', city: 'Mumbai', type: 'attraction' },
  
  // Jaipur
  { id: 'jaipur-1', name: 'Hawa Mahal', latitude: 26.9239, longitude: 75.8267, description: 'Palace of Winds', city: 'Jaipur', type: 'attraction' },
  { id: 'jaipur-2', name: 'Amber Fort', latitude: 26.9855, longitude: 75.8513, description: 'Magnificent hilltop fort', city: 'Jaipur', type: 'attraction' },
  { id: 'jaipur-3', name: 'City Palace', latitude: 26.9258, longitude: 75.8237, description: 'Royal palace complex', city: 'Jaipur', type: 'attraction' },
  
  // Agra
  { id: 'agra-1', name: 'Taj Mahal', latitude: 27.1751, longitude: 78.0421, description: 'Wonder of the World', city: 'Agra', type: 'attraction' },
  { id: 'agra-2', name: 'Agra Fort', latitude: 27.1767, longitude: 78.0081, description: 'UNESCO World Heritage Site', city: 'Agra', type: 'attraction' },
  
  // Goa
  { id: 'goa-1', name: 'Baga Beach', latitude: 15.5552, longitude: 73.7518, description: 'Popular beach destination', city: 'Goa', type: 'attraction' },
  { id: 'goa-2', name: 'Fort Aguada', latitude: 15.4928, longitude: 73.7733, description: 'Portuguese colonial fort', city: 'Goa', type: 'attraction' },
  
  // Bangalore
  { id: 'bangalore-1', name: 'Lalbagh Botanical Garden', latitude: 12.9507, longitude: 77.5848, description: 'Beautiful botanical garden', city: 'Bangalore', type: 'attraction' },
  { id: 'bangalore-2', name: 'Bangalore Palace', latitude: 12.9988, longitude: 77.5921, description: 'Tudor-style palace', city: 'Bangalore', type: 'attraction' },
  
  // Varanasi
  { id: 'varanasi-1', name: 'Dashashwamedh Ghat', latitude: 25.3109, longitude: 83.0107, description: 'Famous Ganga ghat', city: 'Varanasi', type: 'attraction' },
  { id: 'varanasi-2', name: 'Kashi Vishwanath Temple', latitude: 25.3109, longitude: 83.0107, description: 'Sacred Hindu temple', city: 'Varanasi', type: 'attraction' },
  
  // Kerala
  { id: 'kerala-1', name: 'Alleppey Backwaters', latitude: 9.4981, longitude: 76.3388, description: 'Serene backwater cruises', city: 'Kerala', type: 'attraction' },
  { id: 'kerala-2', name: 'Munnar Tea Gardens', latitude: 10.0889, longitude: 77.0595, description: 'Scenic tea plantations', city: 'Kerala', type: 'attraction' },
];

const NOTIFICATION_STORAGE_KEY = 'india_assist_notification_settings';
const NOTIFIED_PLACES_KEY = 'india_assist_notified_places';

interface NotificationSettings {
  enabled: boolean;
  distanceKm: number;
  notifyAttractions: boolean;
  notifyRestaurants: boolean;
  notifyHotels: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  distanceKm: 10,
  notifyAttractions: true,
  notifyRestaurants: true,
  notifyHotels: true,
};

export const useNearbyNotifications = () => {
  const { latitude, longitude, error: locationError, loading: locationLoading } = useGeolocation();
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [notifiedPlaces, setNotifiedPlaces] = useState<Set<string>>(new Set());

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const savedNotified = localStorage.getItem(NOTIFIED_PLACES_KEY);
    if (savedNotified) {
      setNotifiedPlaces(new Set(JSON.parse(savedNotified)));
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermissionGranted(true);
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setPermissionGranted(granted);
      if (granted) {
        toast.success('Push notifications enabled!');
      }
      return granted;
    }

    toast.error('Notification permission was denied. Please enable it in browser settings.');
    return false;
  }, []);

  // Check permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setPermissionGranted(true);
    }
  }, []);

  // Send push notification
  const sendNotification = useCallback((place: NearbyPlace) => {
    if (!permissionGranted || notifiedPlaces.has(place.id)) return;

    const notification = new Notification(`📍 ${place.name} is nearby!`, {
      body: `${place.description} - Only ${place.distance.toFixed(1)} km away in ${place.city}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: place.id,
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Mark as notified
    setNotifiedPlaces(prev => {
      const updated = new Set(prev);
      updated.add(place.id);
      localStorage.setItem(NOTIFIED_PLACES_KEY, JSON.stringify([...updated]));
      return updated;
    });
  }, [permissionGranted, notifiedPlaces]);

  // Find nearby places when location changes
  useEffect(() => {
    if (!latitude || !longitude || !settings.enabled) return;

    const nearby = INDIAN_PLACES
      .filter(place => {
        if (place.type === 'attraction' && !settings.notifyAttractions) return false;
        if (place.type === 'restaurant' && !settings.notifyRestaurants) return false;
        if (place.type === 'hotel' && !settings.notifyHotels) return false;
        return true;
      })
      .map(place => ({
        ...place,
        distance: calculateDistance(latitude, longitude, place.latitude, place.longitude),
      }))
      .filter(place => place.distance <= settings.distanceKm)
      .sort((a, b) => a.distance - b.distance);

    setNearbyPlaces(nearby);

    // Send notifications for new nearby places
    if (permissionGranted) {
      nearby.forEach(place => {
        if (!notifiedPlaces.has(place.id)) {
          sendNotification(place);
        }
      });
    }
  }, [latitude, longitude, settings, permissionGranted, notifiedPlaces, sendNotification]);

  // Clear notified places (for testing)
  const clearNotifiedPlaces = useCallback(() => {
    setNotifiedPlaces(new Set());
    localStorage.removeItem(NOTIFIED_PLACES_KEY);
    toast.success('Notification history cleared');
  }, []);

  return {
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
  };
};
