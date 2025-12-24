import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import { LanguageProvider } from "./components/LanguageTranslator";
import { AuthProvider } from "./hooks/useAuth";
import TravelAssistant from "./components/TravelAssistant";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import Maps from "./pages/Maps";
import Blog from "./pages/Blog";
import TripPlanner from "./pages/TripPlanner";
import Currency from "./pages/Currency";
import Chat from "./pages/Chat";
import Bookings from "./pages/Bookings";
import Emergency from "./pages/Emergency";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import BlogPost from "./pages/BlogPost";
import UniversalTranslator from "./components/UniversalTranslator";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotificationPreferences from "./pages/NotificationPreferences";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  <Route path="/destinations" element={<ProtectedRoute><Destinations /></ProtectedRoute>} />
                  <Route path="/maps" element={<ProtectedRoute><Maps /></ProtectedRoute>} />
                  <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
                  <Route path="/trip-planner" element={<ProtectedRoute><TripPlanner /></ProtectedRoute>} />
                  <Route path="/currency" element={<ProtectedRoute><Currency /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                  <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
                  <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
                  <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
                  <Route path="/blog/:id" element={<ProtectedRoute><BlogPost /></ProtectedRoute>} />
                  <Route path="/translator" element={<ProtectedRoute><UniversalTranslator /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><NotificationPreferences /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <TravelAssistant />
              <footer className="bg-muted/30 border-t py-8 mt-12">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                  <p className="mb-2">© 2025 India Assist - Your Smart Travel Companion</p>
                  <p className="text-sm">Made with ❤️ for travelers exploring Incredible India</p>
                </div>
              </footer>
            </div>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
