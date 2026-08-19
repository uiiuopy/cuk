import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const IMAGES = [
  "WhatsApp Image 2026-08-16 at 10.20.33 PM.jpeg",
  "WhatsApp Image 2026-08-16 at 10.20.52 PM.jpeg",
  "WhatsApp Image 2026-08-16 at 10.20.52 PMn.jpeg",
  "WhatsApp Image 2026-08-16 at 10.21.21 PMpp.jpeg",
  "WhatsApp Image 2026-08-16 at 10.21.22 PM.jpeg",
  "WhatsApp Image 2026-08-16 at 10.21.22 PMnn.jpeg",
  "WhatsApp Image 2026-08-16 at 10.21.22 PMnnn.jpeg",
  "WhatsApp Image 2026-08-16 at 10.21.23 PMmmmm.jpeg",
  "WhatsApp Image 2026-08-16 at 10.21.24 PMmmmm.jpeg",
  "WhatsApp Image 2026-08-16 at 10.21.24 PMmmmmmm.jpeg",
  "WhatsApp Image 2026-08-16 at 10.21.25 PM.jpeg",
  "WhatsApp Image 2026-08-16 at 10.21.25 PMmmmmmm.jpeg",
  "WhatsApp Image 2026-08-16 at 10.21.26 PM.jpeg",
  "WhatsApp Image 2026-08-16 at 10.21.26 PMnnnnn.jpeg",
  "WhatsApp Image 2026-08-16 at 10.21.26 PMuu.jpeg",
  "nnn.jpeg"
];

export default function Gallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === IMAGES.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? IMAGES.length - 1 : prev - 1));
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">
            Photo Gallery
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-slate-500 sm:mt-4">
            Exploring the moments at our lab
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center min-h-[60vh]">
          {/* Main Image */}
          <img
            src={encodeURI(`/photos/carousel/${IMAGES[currentIndex]}`)}
            alt={`Gallery Slide ${currentIndex + 1}`}
            className="max-h-[70vh] object-contain transition-opacity duration-500 select-none"
          />

          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-sm transition-all"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-sm transition-all"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 flex-wrap px-4">
            {IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2.5 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
