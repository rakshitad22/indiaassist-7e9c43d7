import { useState } from "react";
import { Calendar, MapPin, Plus, Trash2, Save, CheckCircle2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import InteractiveBackground from "@/components/InteractiveBackground";

interface Activity {
  id: string;
  name: string;
  time: string;
}

interface Destination {
  id: string;
  name: string;
  date: string;
  activities: Activity[];
}

interface BudgetEstimate {
  accommodation: number;
  transport: number;
  food: number;
  activities: number;
  total: number;
}

const accommodationTypes = {
  budget: { name: "Budget (₹1,000-2,000/night)", cost: 1500 },
  standard: { name: "Standard (₹2,000-5,000/night)", cost: 3500 },
  luxury: { name: "Luxury (₹5,000+/night)", cost: 8000 },
};

const TripPlanner = () => {
  const { toast } = useToast();
  const [tripName, setTripName] = useState("");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [newDestName, setNewDestName] = useState("");
  const [newDestDate, setNewDestDate] = useState("");
  const [numberOfDays, setNumberOfDays] = useState("3");
  const [numberOfPeople, setNumberOfPeople] = useState("2");
  const [accommodationType, setAccommodationType] = useState<keyof typeof accommodationTypes>("standard");
  const [showSuccess, setShowSuccess] = useState(false);

  const calculateBudget = (): BudgetEstimate => {
    const days = parseInt(numberOfDays) || 1;
    const people = parseInt(numberOfPeople) || 1;
    const accommodation = accommodationTypes[accommodationType].cost * days;
    const transport = 1500 * days * people; // Average transport per day per person
    const food = 1000 * days * people; // Average food per day per person
    const activities = 2000 * days * people; // Average activities per day per person
    const total = accommodation + transport + food + activities;
    
    return { accommodation, transport, food, activities, total };
  };

  const addDestination = () => {
    // Validate number of people first
    const peopleCount = parseInt(numberOfPeople);
    if (!peopleCount || peopleCount < 1) {
      toast({
        title: "Number of Customers Required",
        description: "Please select the number of people before adding destinations",
        variant: "destructive",
      });
      return;
    }

    if (!newDestName || !newDestDate) {
      toast({
        title: "Missing Information",
        description: "Please enter both destination name and date",
        variant: "destructive",
      });
      return;
    }

    const newDest: Destination = {
      id: Date.now().toString(),
      name: newDestName,
      date: newDestDate,
      activities: [],
    };

    setDestinations([...destinations, newDest]);
    setNewDestName("");
    setNewDestDate("");
    toast({
      title: "Destination Added!",
      description: `${newDestName} has been added to your trip`,
    });
  };

  const removeDestination = (id: string) => {
    setDestinations(destinations.filter((d) => d.id !== id));
    toast({
      title: "Destination Removed",
      description: "Destination has been removed from your trip",
    });
  };

  const addActivity = (destId: string, activityName: string, time: string) => {
    if (!activityName || !time) return;

    setDestinations(
      destinations.map((dest) =>
        dest.id === destId
          ? {
              ...dest,
              activities: [
                ...dest.activities,
                { id: Date.now().toString(), name: activityName, time },
              ],
            }
          : dest
      )
    );
  };

  const removeActivity = (destId: string, activityId: string) => {
    setDestinations(
      destinations.map((dest) =>
        dest.id === destId
          ? {
              ...dest,
              activities: dest.activities.filter((a) => a.id !== activityId),
            }
          : dest
      )
    );
  };

  const saveTripPlan = () => {
    if (!tripName) {
      toast({
        title: "Trip Name Required",
        description: "Please enter a name for your trip",
        variant: "destructive",
      });
      return;
    }

    const tripPlan = {
      name: tripName,
      destinations,
      numberOfDays,
      numberOfPeople,
      accommodationType,
      budget: calculateBudget(),
      createdAt: new Date().toISOString(),
    };
    
    const savedTrips = JSON.parse(localStorage.getItem("tripPlans") || "[]");
    savedTrips.push(tripPlan);
    localStorage.setItem("tripPlans", JSON.stringify(savedTrips));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    toast({
      title: "Trip Saved Successfully! ✅",
      description: "Your trip itinerary has been saved to local storage",
    });
  };

  const budget = calculateBudget();

  return (
    <div className="min-h-screen relative">
      <InteractiveBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-gradient">
              Trip Planner
            </h1>
            <p className="text-muted-foreground text-lg">
              Create your perfect Indian adventure with budget estimates
            </p>
          </div>

          {/* Success Animation */}
          {showSuccess && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-scale-in">
              <Card className="shadow-2xl border-2 border-green-500">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4 animate-pulse" />
                  <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    Trip Saved Successfully!
                  </h2>
                  <p className="text-muted-foreground">Your itinerary is ready for your adventure</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Trip Details */}
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tripName">Trip Name *</Label>
                <Input
                  id="tripName"
                  placeholder="e.g., Golden Triangle Tour"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="days">Number of Days</Label>
                  <Select value={numberOfDays} onValueChange={setNumberOfDays}>
                    <SelectTrigger id="days">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Day" : "Days"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="people">Number of People</Label>
                  <Select value={numberOfPeople} onValueChange={setNumberOfPeople}>
                    <SelectTrigger id="people">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Person" : "People"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accommodation">Accommodation Type</Label>
                  <Select value={accommodationType} onValueChange={(value: any) => setAccommodationType(value)}>
                    <SelectTrigger id="accommodation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(accommodationTypes).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Estimate */}
          <Card className="mb-6 shadow-card gradient-hero text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Estimated Budget Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/20">
                  <span className="text-sm opacity-90">Accommodation ({numberOfDays} days):</span>
                  <span className="font-semibold">₹{budget.accommodation.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/20">
                  <span className="text-sm opacity-90">Transport ({numberOfPeople} people):</span>
                  <span className="font-semibold">₹{budget.transport.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/20">
                  <span className="text-sm opacity-90">Food & Dining:</span>
                  <span className="font-semibold">₹{budget.food.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/20">
                  <span className="text-sm opacity-90">Activities & Entertainment:</span>
                  <span className="font-semibold">₹{budget.activities.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-white/40">
                  <span className="text-lg font-bold">Total Estimated Cost:</span>
                  <span className="text-2xl font-bold">₹{budget.total.toLocaleString()}</span>
                </div>
                <p className="text-xs opacity-75 text-center mt-3">
                  * Estimates are approximate and may vary based on actual choices
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Add Destination */}
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Add Destination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destName">Destination</Label>
                  <Input
                    id="destName"
                    placeholder="e.g., Delhi"
                    value={newDestName}
                    onChange={(e) => setNewDestName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destDate">Date</Label>
                  <Input
                    id="destDate"
                    type="date"
                    value={newDestDate}
                    onChange={(e) => setNewDestDate(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addDestination} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Destination
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destinations List */}
          <div className="space-y-4 mb-6">
            {destinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onRemove={removeDestination}
                onAddActivity={addActivity}
                onRemoveActivity={removeActivity}
              />
            ))}
          </div>

          {/* Save Button */}
          {destinations.length > 0 && (
            <div className="flex justify-center">
              <Button
                onClick={saveTripPlan}
                size="lg"
                className="gradient-saffron text-white px-12 py-6 text-lg"
              >
                <Save className="h-6 w-6 mr-2" />
                Save Trip Plan
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface DestinationCardProps {
  destination: Destination;
  onRemove: (id: string) => void;
  onAddActivity: (destId: string, name: string, time: string) => void;
  onRemoveActivity: (destId: string, activityId: string) => void;
}

const DestinationCard = ({
  destination,
  onRemove,
  onAddActivity,
  onRemoveActivity,
}: DestinationCardProps) => {
  const [activityName, setActivityName] = useState("");
  const [activityTime, setActivityTime] = useState("");

  const handleAddActivity = () => {
    if (activityName && activityTime) {
      onAddActivity(destination.id, activityName, activityTime);
      setActivityName("");
      setActivityTime("");
    }
  };

  return (
    <Card className="shadow-card hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {destination.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(destination.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(destination.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Activities List */}
        {destination.activities.length > 0 && (
          <div className="mb-4 space-y-2">
            {destination.activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div>
                  <p className="font-medium">{activity.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveActivity(destination.id, activity.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add Activity Form */}
        <div className="grid md:grid-cols-3 gap-3 pt-3 border-t">
          <Input
            placeholder="Activity name"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
          />
          <Input
            type="time"
            value={activityTime}
            onChange={(e) => setActivityTime(e.target.value)}
          />
          <Button onClick={handleAddActivity} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripPlanner;