import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Store to localStorage (demo purpose)
    const contacts = JSON.parse(localStorage.getItem("contacts") || "[]");
    contacts.push({
      ...formData,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("contacts", JSON.stringify(contacts));

    // Simulate submission delay
    setTimeout(() => {
      toast({
        title: "Thank you for contacting IndiaAssist! ✅",
        description: "We'll reach out soon.",
      });

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
          <div className="mt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Project Team</h2>
            <div className="flex flex-wrap justify-center gap-3 mb-2">
              <span className="px-4 py-2 bg-primary/10 rounded-lg font-medium">Rakshita D</span>
              <span className="px-4 py-2 bg-primary/10 rounded-lg font-medium">Anu Nyamgoud</span>
              <span className="px-4 py-2 bg-primary/10 rounded-lg font-medium">S Vaishnavi Bharadwaj</span>
              <span className="px-4 py-2 bg-primary/10 rounded-lg font-medium">Punith Reddy K R</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Department of Information Science and Engineering<br />
              Sri Krishna Institute of Technology, Bengaluru
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg-custom">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
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
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What is this about?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Your message..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gradient-saffron text-white"
                    size="lg"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Us</h3>
                    <p className="text-sm text-muted-foreground">support@indiaassist.com</p>
                    <p className="text-sm text-muted-foreground">info@indiaassist.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-saffron/10 rounded-lg">
                    <Phone className="h-6 w-6 text-saffron" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Call Us</h3>
                    <p className="text-sm text-muted-foreground">+91 1800-123-4567</p>
                    <p className="text-sm text-muted-foreground">24/7 Support Available</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Visit Us</h3>
                    <p className="text-sm text-muted-foreground">
                      Connaught Place<br />
                      New Delhi, India 110001
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card gradient-saffron text-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-3">Business Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-semibold">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-semibold">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-semibold">Closed</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/20">
                    <p className="text-xs">Emergency Support: Available 24/7</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3">FAQs</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Visa and travel requirements</li>
                  <li>• Best time to visit India</li>
                  <li>• Currency and payment methods</li>
                  <li>• Safety and health tips</li>
                  <li>• Transportation options</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
