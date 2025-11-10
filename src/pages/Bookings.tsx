import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Car, Hotel, Users, Plane, CheckCircle, Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Booking {
  id: string;
  type: "hotel" | "cab" | "flight";
  name: string;
  email: string;
  phone: string;
  date: string;
  returnDate?: string;
  destination: string;
  pickup?: string;
  guests: string;
  class?: string;
  hotel?: string;
  cabType?: string;
  bookingId: string;
  pnr?: string;
  fare: number;
  taxes: number;
  total: number;
  details: any;
  timestamp: string;
}

const hotelOptions = {
  "Delhi": [
    { name: "The Taj Palace", stars: 5, basePrice: 15000 },
    { name: "Oberoi Hotel", stars: 5, basePrice: 12000 },
    { name: "Radisson Blu", stars: 4, basePrice: 8000 },
    { name: "Holiday Inn", stars: 3, basePrice: 5000 },
  ],
  "Mumbai": [
    { name: "Taj Mahal Palace", stars: 5, basePrice: 18000 },
    { name: "The Oberoi Mumbai", stars: 5, basePrice: 14000 },
    { name: "ITC Grand Central", stars: 4, basePrice: 9000 },
    { name: "Novotel Mumbai", stars: 4, basePrice: 7000 },
  ],
  "Jaipur": [
    { name: "Rambagh Palace", stars: 5, basePrice: 20000 },
    { name: "Oberoi Rajvilas", stars: 5, basePrice: 16000 },
    { name: "Hilton Jaipur", stars: 4, basePrice: 7500 },
    { name: "Park Prime", stars: 3, basePrice: 4500 },
  ],
  "Agra": [
    { name: "The Oberoi Amarvilas", stars: 5, basePrice: 25000 },
    { name: "ITC Mughal", stars: 5, basePrice: 12000 },
    { name: "Taj Hotel & Convention Centre", stars: 4, basePrice: 8500 },
    { name: "Howard Plaza", stars: 3, basePrice: 4000 },
  ],
};

const cabTypes = [
  { type: "Mini", basePrice: 10, capacity: 4 },
  { type: "Sedan", basePrice: 15, capacity: 4 },
  { type: "SUV", basePrice: 20, capacity: 6 },
  { type: "Luxury", basePrice: 35, capacity: 4 },
];

const flightClasses = {
  economy: { multiplier: 1, name: "Economy" },
  premium: { multiplier: 1.5, name: "Premium Economy" },
  business: { multiplier: 2.5, name: "Business Class" },
  first: { multiplier: 4, name: "First Class" },
};

const Bookings = () => {
  const [bookingType, setBookingType] = useState<"hotel" | "cab" | "flight">("hotel");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [savedBookings, setSavedBookings] = useState<Booking[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    returnDate: "",
    destination: "Delhi",
    pickup: "",
    guests: "1",
    class: "economy",
    hotel: "",
    cabType: "Sedan",
    distance: "10",
  });
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("bookings");
    if (saved) {
      setSavedBookings(JSON.parse(saved));
    }
  }, []);

  const generateBookingId = () => {
    return `BK${Date.now().toString().slice(-8)}`;
  };

  const generatePNR = () => {
    return `PNR${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };

  const calculateHotelCost = () => {
    const hotels = hotelOptions[formData.destination as keyof typeof hotelOptions] || hotelOptions["Delhi"];
    const selectedHotel = hotels.find(h => h.name === formData.hotel) || hotels[0];
    const baseFare = selectedHotel.basePrice * parseInt(formData.guests);
    const taxes = Math.round(baseFare * 0.18);
    return { fare: baseFare, taxes, total: baseFare + taxes, hotel: selectedHotel };
  };

  const calculateCabCost = () => {
    const cab = cabTypes.find(c => c.type === formData.cabType) || cabTypes[0];
    const distance = parseInt(formData.distance) || 10;
    const baseFare = cab.basePrice * distance;
    const taxes = Math.round(baseFare * 0.05);
    return { fare: baseFare, taxes, total: baseFare + taxes, cab };
  };

  const calculateFlightCost = () => {
    const basePrice = 5000;
    const classInfo = flightClasses[formData.class as keyof typeof flightClasses];
    const baseFare = Math.round(basePrice * classInfo.multiplier * parseInt(formData.guests));
    const taxes = Math.round(baseFare * 0.12);
    return { fare: baseFare, taxes, total: baseFare + taxes, classInfo };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    let booking: Booking;
    const bookingId = generateBookingId();
    const timestamp = new Date().toISOString();

    if (bookingType === "hotel") {
      const cost = calculateHotelCost();
      booking = {
        id: bookingId,
        type: "hotel",
        bookingId,
        ...formData,
        fare: cost.fare,
        taxes: cost.taxes,
        total: cost.total,
        details: { hotel: cost.hotel },
        timestamp,
      };
    } else if (bookingType === "cab") {
      const cost = calculateCabCost();
      booking = {
        id: bookingId,
        type: "cab",
        bookingId,
        ...formData,
        fare: cost.fare,
        taxes: cost.taxes,
        total: cost.total,
        details: { cab: cost.cab, distance: formData.distance },
        timestamp,
      };
    } else {
      const cost = calculateFlightCost();
      const pnr = generatePNR();
      booking = {
        id: bookingId,
        type: "flight",
        bookingId,
        pnr,
        ...formData,
        fare: cost.fare,
        taxes: cost.taxes,
        total: cost.total,
        details: { classInfo: cost.classInfo },
        timestamp,
      };
    }

    setConfirmedBooking(booking);
    const updatedBookings = [...savedBookings, booking];
    setSavedBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    setShowConfirmation(true);
  };

  const downloadReceipt = () => {
    if (!confirmedBooking) return;
    
    const receiptContent = `
INDIA ASSIST - BOOKING RECEIPT
================================

Booking ID: ${confirmedBooking.bookingId}
${confirmedBooking.pnr ? `PNR: ${confirmedBooking.pnr}` : ''}
Type: ${confirmedBooking.type.toUpperCase()}
Date: ${new Date(confirmedBooking.timestamp).toLocaleString()}

PASSENGER DETAILS
----------------
Name: ${confirmedBooking.name}
Email: ${confirmedBooking.email}
Phone: ${confirmedBooking.phone}

BOOKING DETAILS
--------------
${confirmedBooking.type === 'hotel' ? `Hotel: ${confirmedBooking.hotel}\nStars: ${confirmedBooking.details.hotel.stars}⭐` : ''}
${confirmedBooking.type === 'cab' ? `Cab Type: ${confirmedBooking.cabType}\nDistance: ${confirmedBooking.details.distance} km` : ''}
${confirmedBooking.type === 'flight' ? `From: ${confirmedBooking.pickup}\nTo: ${confirmedBooking.destination}\nClass: ${confirmedBooking.details.classInfo.name}` : ''}
Destination: ${confirmedBooking.destination}
Date: ${confirmedBooking.date}
${confirmedBooking.returnDate ? `Return: ${confirmedBooking.returnDate}` : ''}
Guests/Passengers: ${confirmedBooking.guests}

PAYMENT BREAKDOWN
----------------
Base Fare: ₹${confirmedBooking.fare.toLocaleString()}
Taxes & Fees: ₹${confirmedBooking.taxes.toLocaleString()}
Total Amount: ₹${confirmedBooking.total.toLocaleString()}

Thank you for choosing India Assist!
For support: support@indiaassist.com | +91 1800-123-4567
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IndiaAssist_Receipt_${confirmedBooking.bookingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Receipt Downloaded",
      description: "Your booking receipt has been downloaded successfully",
    });
  };

  const printReceipt = () => {
    window.print();
    toast({
      title: "Printing...",
      description: "Your receipt is being prepared for printing",
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">Book Your Experience</h1>
          <p className="text-xl text-muted-foreground">
            Reserve hotels, flights, and cabs for your India journey
          </p>
        </div>

        <Card className="shadow-lg-custom mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {bookingType === "hotel" && <Hotel className="h-5 w-5 text-primary" />}
              {bookingType === "flight" && <Plane className="h-5 w-5 text-primary" />}
              {bookingType === "cab" && <Car className="h-5 w-5 text-primary" />}
              Booking Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Booking Type Selection */}
              <div className="grid grid-cols-3 gap-4">
                <Button
                  type="button"
                  variant={bookingType === "hotel" ? "default" : "outline"}
                  onClick={() => setBookingType("hotel")}
                  className="h-20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Hotel className="h-6 w-6" />
                    <span>Hotel</span>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={bookingType === "flight" ? "default" : "outline"}
                  onClick={() => setBookingType("flight")}
                  className="h-20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Plane className="h-6 w-6" />
                    <span>Flight</span>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={bookingType === "cab" ? "default" : "outline"}
                  onClick={() => setBookingType("cab")}
                  className="h-20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Car className="h-6 w-6" />
                    <span>Cab</span>
                  </div>
                </Button>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 XXXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Booking Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination/City *</Label>
                  <Select value={formData.destination} onValueChange={(value) => setFormData({ ...formData, destination: value })}>
                    <SelectTrigger id="destination">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Mumbai">Mumbai</SelectItem>
                      <SelectItem value="Jaipur">Jaipur</SelectItem>
                      <SelectItem value="Agra">Agra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {bookingType === "hotel" && (
                  <div className="space-y-2">
                    <Label htmlFor="hotel">Select Hotel *</Label>
                    <Select value={formData.hotel} onValueChange={(value) => setFormData({ ...formData, hotel: value })}>
                      <SelectTrigger id="hotel">
                        <SelectValue placeholder="Choose a hotel" />
                      </SelectTrigger>
                      <SelectContent>
                        {(hotelOptions[formData.destination as keyof typeof hotelOptions] || hotelOptions["Delhi"]).map((hotel) => (
                          <SelectItem key={hotel.name} value={hotel.name}>
                            {hotel.name} - {hotel.stars}⭐ (₹{hotel.basePrice.toLocaleString()}/night)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {bookingType === "cab" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cabType">Cab Type *</Label>
                      <Select value={formData.cabType} onValueChange={(value) => setFormData({ ...formData, cabType: value })}>
                        <SelectTrigger id="cabType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {cabTypes.map((cab) => (
                            <SelectItem key={cab.type} value={cab.type}>
                              {cab.type} - ₹{cab.basePrice}/km (Capacity: {cab.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickup">Pickup Location *</Label>
                      <Input
                        id="pickup"
                        placeholder="Enter pickup address"
                        value={formData.pickup}
                        onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="distance">Estimated Distance (km) *</Label>
                      <Input
                        id="distance"
                        type="number"
                        min="1"
                        value={formData.distance}
                        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                {bookingType === "flight" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="pickup">From (City/Airport) *</Label>
                      <Input
                        id="pickup"
                        placeholder="Enter departure city"
                        value={formData.pickup}
                        onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class">Flight Class *</Label>
                      <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                        <SelectTrigger id="class">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(flightClasses).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {bookingType === "hotel" ? "Check-in Date *" : bookingType === "flight" ? "Departure Date *" : "Pickup Date *"}
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  {bookingType === "flight" && (
                    <div className="space-y-2">
                      <Label htmlFor="returnDate">Return Date</Label>
                      <Input
                        id="returnDate"
                        type="date"
                        value={formData.returnDate}
                        onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests">
                    <Users className="h-4 w-4 inline mr-1" />
                    Number of {bookingType === "hotel" ? "Guests" : "Passengers"}
                  </Label>
                  <Select value={formData.guests} onValueChange={(value) => setFormData({ ...formData, guests: value })}>
                    <SelectTrigger id="guests">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? (bookingType === "hotel" ? "Guest" : "Passenger") : (bookingType === "hotel" ? "Guests" : "Passengers")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cost Estimate */}
                {formData.hotel && bookingType === "hotel" && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Base Fare:</span>
                          <span>₹{calculateHotelCost().fare.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Taxes (18%):</span>
                          <span>₹{calculateHotelCost().taxes.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total:</span>
                          <span className="text-primary">₹{calculateHotelCost().total.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {bookingType === "cab" && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Base Fare:</span>
                          <span>₹{calculateCabCost().fare.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Taxes (5%):</span>
                          <span>₹{calculateCabCost().taxes.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total:</span>
                          <span className="text-primary">₹{calculateCabCost().total.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {bookingType === "flight" && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Base Fare:</span>
                          <span>₹{calculateFlightCost().fare.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Taxes (12%):</span>
                          <span>₹{calculateFlightCost().taxes.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total:</span>
                          <span className="text-primary">₹{calculateFlightCost().total.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Button type="submit" className="w-full gradient-hero text-white" size="lg">
                Confirm Booking
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Booking Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center animate-scale-in">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">Booking Confirmed! 🎉</DialogTitle>
              <DialogDescription className="text-center">
                Your {confirmedBooking?.type} booking has been successfully confirmed
              </DialogDescription>
            </DialogHeader>
            {confirmedBooking && (
              <div className="space-y-4 py-4">
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">Booking ID</p>
                      <p className="text-2xl font-bold text-primary">{confirmedBooking.bookingId}</p>
                      {confirmedBooking.pnr && (
                        <>
                          <p className="text-sm text-muted-foreground mt-2">PNR</p>
                          <p className="text-xl font-bold">{confirmedBooking.pnr}</p>
                        </>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{confirmedBooking.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{confirmedBooking.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{confirmedBooking.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">{confirmedBooking.date}</span>
                      </div>
                      {confirmedBooking.type === "hotel" && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hotel:</span>
                          <span className="font-medium">{confirmedBooking.hotel} - {confirmedBooking.details.hotel.stars}⭐</span>
                        </div>
                      )}
                      {confirmedBooking.type === "cab" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cab Type:</span>
                            <span className="font-medium">{confirmedBooking.cabType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Distance:</span>
                            <span className="font-medium">{confirmedBooking.details.distance} km</span>
                          </div>
                        </>
                      )}
                      {confirmedBooking.type === "flight" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">From:</span>
                            <span className="font-medium">{confirmedBooking.pickup}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">To:</span>
                            <span className="font-medium">{confirmedBooking.destination}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Class:</span>
                            <span className="font-medium">{confirmedBooking.details.classInfo.name}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base Fare:</span>
                        <span>₹{confirmedBooking.fare.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxes:</span>
                        <span>₹{confirmedBooking.taxes.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2">
                        <span>Total Amount:</span>
                        <span className="text-primary">₹{confirmedBooking.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm text-center">
                    ℹ️ This is a demo booking. No actual reservation has been made. You can download your receipt below.
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={downloadReceipt} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              <Button variant="outline" onClick={printReceipt} className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
              <Button onClick={() => setShowConfirmation(false)} className="flex-1 gradient-saffron text-white">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Bookings;