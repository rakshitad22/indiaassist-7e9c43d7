import { useState, useEffect } from "react";
import { Bell, Mail, MessageSquare, Smartphone, Plane, Tag, Lightbulb, Gift, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface NotificationPreferences {
  booking_confirmations: boolean;
  booking_reminders: boolean;
  price_alerts: boolean;
  travel_tips: boolean;
  promotional: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
}

const defaultPreferences: NotificationPreferences = {
  booking_confirmations: true,
  booking_reminders: true,
  price_alerts: false,
  travel_tips: true,
  promotional: false,
  email_enabled: true,
  push_enabled: true,
  sms_enabled: false,
};

const NotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          booking_confirmations: data.booking_confirmations,
          booking_reminders: data.booking_reminders,
          price_alerts: data.price_alerts,
          travel_tips: data.travel_tips,
          promotional: data.promotional,
          email_enabled: data.email_enabled,
          push_enabled: data.push_enabled,
          sms_enabled: data.sms_enabled,
        });
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
        }, { onConflict: "user_id" });

      if (error) throw error;

      toast.success("Notification preferences saved!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Preferences</h1>
        <p className="text-muted-foreground">
          Customize how and when you receive notifications about your travel plans.
        </p>
      </div>

      <div className="space-y-6">
        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Types
            </CardTitle>
            <CardDescription>
              Choose which types of notifications you want to receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Plane className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="booking_confirmations" className="font-medium">
                    Booking Confirmations
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive confirmations when bookings are made or updated.
                  </p>
                </div>
              </div>
              <Switch
                id="booking_confirmations"
                checked={preferences.booking_confirmations}
                onCheckedChange={(checked) => updatePreference("booking_confirmations", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="booking_reminders" className="font-medium">
                    Booking Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders before your trips and check-in times.
                  </p>
                </div>
              </div>
              <Switch
                id="booking_reminders"
                checked={preferences.booking_reminders}
                onCheckedChange={(checked) => updatePreference("booking_reminders", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="price_alerts" className="font-medium">
                    Price Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Be notified when prices drop for your saved destinations.
                  </p>
                </div>
              </div>
              <Switch
                id="price_alerts"
                checked={preferences.price_alerts}
                onCheckedChange={(checked) => updatePreference("price_alerts", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="travel_tips" className="font-medium">
                    Travel Tips
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive helpful tips and recommendations for your trips.
                  </p>
                </div>
              </div>
              <Switch
                id="travel_tips"
                checked={preferences.travel_tips}
                onCheckedChange={(checked) => updatePreference("travel_tips", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="promotional" className="font-medium">
                    Promotional Offers
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Special deals, discounts, and promotional content.
                  </p>
                </div>
              </div>
              <Switch
                id="promotional"
                checked={preferences.promotional}
                onCheckedChange={(checked) => updatePreference("promotional", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Delivery Channels
            </CardTitle>
            <CardDescription>
              Choose how you want to receive your notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="email_enabled" className="font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email.
                  </p>
                </div>
              </div>
              <Switch
                id="email_enabled"
                checked={preferences.email_enabled}
                onCheckedChange={(checked) => updatePreference("email_enabled", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="push_enabled" className="font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser.
                  </p>
                </div>
              </div>
              <Switch
                id="push_enabled"
                checked={preferences.push_enabled}
                onCheckedChange={(checked) => updatePreference("push_enabled", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="sms_enabled" className="font-medium">
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via text message.
                  </p>
                </div>
              </div>
              <Switch
                id="sms_enabled"
                checked={preferences.sms_enabled}
                onCheckedChange={(checked) => updatePreference("sms_enabled", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={savePreferences} className="w-full" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
