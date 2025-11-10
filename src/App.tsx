import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import { LanguageProvider } from "./components/LanguageTranslator";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/maps" element={<Maps />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/trip-planner" element={<TripPlanner />} />
                <Route path="/currency" element={<Currency />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/translator" element={<UniversalTranslator />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <footer className="bg-muted/30 border-t py-8 mt-12">
              <div className="container mx-auto px-4 text-center text-muted-foreground">
                <p className="mb-2">© 2025 India Assist - Your Smart Travel Companion</p>
                <p className="text-sm">Made with ❤️ for travelers exploring Incredible India</p>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
