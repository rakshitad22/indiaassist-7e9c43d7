import { useState } from "react";
import { X } from "lucide-react";

const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1564507592333-c60657eea523",
    alt: "Taj Mahal at sunrise",
    location: "Agra",
    description: "The iconic Taj Mahal, one of the Seven Wonders of the World",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da",
    alt: "Hawa Mahal",
    location: "Jaipur",
    description: "The beautiful Palace of Winds in the Pink City",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96",
    alt: "Kerala Backwaters",
    location: "Kerala",
    description: "Serene backwaters and houseboats of Kerala",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1558431382-27e303142255",
    alt: "Goa Beach",
    location: "Goa",
    description: "Beautiful beaches and coastal charm of Goa",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1587474260584-136574528ed5",
    alt: "Varanasi Ghats",
    location: "Varanasi",
    description: "Ancient ghats along the holy river Ganges",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1577086664693-894d8405334c",
    alt: "Gateway of India",
    location: "Mumbai",
    description: "The iconic Gateway of India monument",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1609137144813-7d9921338f24",
    alt: "Indian Street Food",
    location: "Delhi",
    description: "Colorful and delicious Indian street food",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1532375810709-75b1da00537c",
    alt: "Amber Fort",
    location: "Jaipur",
    description: "The magnificent Amber Fort overlooking Maota Lake",
  },
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Photo Gallery</h1>
          <p className="text-xl text-muted-foreground">Explore the beauty of India through stunning imagery</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-lg cursor-pointer shadow-lg-custom hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg mb-1">{image.location}</h3>
                  <p className="text-white/90 text-sm">{image.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-saffron transition-colors p-2 rounded-full bg-white/10 hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="max-w-6xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="mt-6 text-center">
                <h2 className="text-white text-3xl font-bold mb-2">{selectedImage.location}</h2>
                <p className="text-white/80 text-lg">{selectedImage.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;