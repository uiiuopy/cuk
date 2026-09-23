import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon, 
  Calendar,
  Sparkles,
  Layers
} from 'lucide-react';

export interface GalleryItem {
  id: string;
  src: string;
  title: string;
  category: 'Events' | 'Research' | 'Instruments' | 'Facilities';
  description: string;
  date?: string;
  isPlaceholder?: boolean;
}

/**
 * Gallery Image Registry
 * Images are located in `/public/photos/` with standardized filenames `lab-gallery-N.jpg`.
 * To add new photos:
 * 1. Place `lab-gallery-{N}.jpg` inside `client/public/photos/`
 * 2. Update or activate the corresponding entry below.
 */
export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    src: '/photos/lab-gallery-1.jpg',
    title: 'Biofeedback Laboratory Inauguration Plaque',
    category: 'Events',
    description: 'Official inauguration ceremony and stone dedication of the Biofeedback Laboratory at Central University of Karnataka with faculty and university administration.',
    date: 'February 2025'
  },
  {
    id: 'gal-2',
    src: '/photos/lab-gallery-2.jpg',
    title: 'Physiological Sensor Calibration & Modalities',
    category: 'Instruments',
    description: 'Faculty inspection and calibration of autonomic sensors including skin conductance, photoplethysmography, and peripheral temperature probes.',
    date: 'February 2025'
  },
  {
    id: 'gal-3',
    src: '/photos/lab-gallery-3.jpg',
    title: 'Laboratory Facility Demonstration Tour',
    category: 'Events',
    description: 'Demonstrating state-of-the-art biofeedback acquisition equipment and psychophysiological recording protocols to visiting faculty and scholars.',
    date: 'February 2025'
  },
  {
    id: 'gal-4',
    src: '/photos/lab-gallery-4.jpg',
    title: 'Immersive VR & Neurofeedback Session',
    category: 'Research',
    description: 'Research participant engaged in cognitive stress-resilience protocols integrating virtual reality immersion with continuous biosignal telemetry.',
    date: 'March 2025'
  },
  {
    id: 'gal-5',
    src: '/photos/lab-gallery-5.jpg',
    title: 'Departmental Student Practicum & Workshop',
    category: 'Research',
    description: 'Postgraduate and doctoral research scholars gathered for interactive neuro-behavioral experiment execution and real-time biosignal monitoring.',
    date: 'March 2025'
  },
  {
    id: 'gal-6',
    src: '/photos/lab-gallery-6.jpg',
    title: '64-Channel Active EEG Montage Setup',
    category: 'Instruments',
    description: 'High-density active wet-gel EEG cap placement and impedance reduction protocols for cognitive event-related potential investigations.',
    date: 'January 2025'
  },
  {
    id: 'gal-7',
    src: '/photos/lab-gallery-7.jpg',
    title: 'Experimental Isolation Testing Bay',
    category: 'Facilities',
    description: 'Dedicated participant testing cubicle designed for controlled psychophysiological and sensory-cognitive experimentation.',
    date: 'January 2025'
  },
  {
    id: 'gal-8',
    src: '/photos/lab-gallery-8.jpg',
    title: 'Multimodal Biosignal Telemetry Array',
    category: 'Instruments',
    description: 'Synchronized multichannel hardware recording autonomic, electrodermal, and respiration dynamics simultaneously.',
    date: 'December 2024'
  },
  {
    id: 'gal-9',
    src: '/photos/lab-gallery-9.jpg',
    title: 'Participant Briefing & Neuro-Protocol',
    category: 'Research',
    description: 'Participant orientation, informed consent, and preparation for experimental psychophysiology trials.',
    date: 'December 2024'
  },
  {
    id: 'gal-10',
    src: '/photos/lab-gallery-10.jpg',
    title: 'Quantitative EEG & Power Spectral Analysis',
    category: 'Research',
    description: 'Real-time Fast Fourier Transform (FFT) analysis of theta, alpha, and beta oscillatory band power during cognitive engagement.',
    date: 'November 2024'
  },
  {
    id: 'gal-11',
    src: '/photos/lab-gallery-11.jpg',
    title: 'Autonomic HRV & Coherence Training',
    category: 'Instruments',
    description: 'Heart Rate Variability (HRV) biofeedback workstation assisting participants in achieving resonant cardiorespiratory synchronization.',
    date: 'November 2024'
  },
  {
    id: 'gal-12',
    src: '/photos/lab-gallery-12.jpg',
    title: 'Neurocomputing & Signal Processing Suite',
    category: 'Facilities',
    description: 'High-performance computing workstations equipped for artifact rejection, MNE-Python filtering, and statistical analysis.',
    date: 'October 2024'
  },
  // Upcoming Event & Photo Placeholders (Expandable capacity)
  {
    id: 'gal-13',
    src: '/photos/lab-gallery-13.jpg',
    title: 'Cognitive Neurobiology Workshop 2025',
    category: 'Events',
    description: 'Upcoming national workshop on translational cognitive neuroscience, EEG analytics, and biofeedback intervention protocols.',
    date: 'Upcoming 2025',
    isPlaceholder: true
  },
  {
    id: 'gal-14',
    src: '/photos/lab-gallery-14.jpg',
    title: 'Eye-Tracking & Pupillometry Bay',
    category: 'Instruments',
    description: 'Infrared gaze-tracking and fixation analysis workstation for visual attention and oculomotor research.',
    date: 'Upcoming 2025',
    isPlaceholder: true
  },
  {
    id: 'gal-15',
    src: '/photos/lab-gallery-15.jpg',
    title: 'Collaborative Clinical Field Trials',
    category: 'Research',
    description: 'Field studies and cross-institutional clinical evaluations in stress mitigation and neurocognitive health.',
    date: 'Upcoming 2025',
    isPlaceholder: true
  },
  {
    id: 'gal-16',
    src: '/photos/lab-gallery-16.jpg',
    title: 'Annual Symposium & Poster Session',
    category: 'Events',
    description: 'Student researchers showcasing empirical psychophysiology discoveries and thesis publications.',
    date: 'Upcoming 2025',
    isPlaceholder: true
  }
];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Filter gallery items
  const filteredItems = selectedCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === selectedCategory);

  // Active items available in lightbox (excluding placeholder cards without photos)
  const activePhotos = filteredItems.filter(item => !item.isPlaceholder && !failedImages[item.id]);

  // Keyboard navigation for lightbox modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') setActiveLightboxIndex(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, activePhotos.length]);

  const handleOpenLightbox = (item: GalleryItem) => {
    const index = activePhotos.findIndex(p => p.id === item.id);
    if (index !== -1) {
      setActiveLightboxIndex(index);
    }
  };

  const handleNext = () => {
    if (activeLightboxIndex === null || activePhotos.length === 0) return;
    setActiveLightboxIndex((prev) => (prev! + 1) % activePhotos.length);
  };

  const handlePrev = () => {
    if (activeLightboxIndex === null || activePhotos.length === 0) return;
    setActiveLightboxIndex((prev) => (prev! - 1 + activePhotos.length) % activePhotos.length);
  };

  const currentPhoto = activeLightboxIndex !== null ? activePhotos[activeLightboxIndex] : null;

  const categories = ['All', 'Events', 'Research', 'Instruments', 'Facilities'];

  return (
    <div className="min-h-screen py-12 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Block */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-950 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100 inline-block">
              Visual Impressions & Archives
            </span>
            <div className="flex items-center gap-3 text-blue-950">
              <div className="p-2.5 rounded-xl bg-blue-950 text-white shadow-sm shrink-0">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Laboratory Photo Gallery
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Documenting experimental bays, inaugural milestones, student research, and advanced biosignal recording sessions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600">
            <Layers className="h-4 w-4 text-blue-950" />
            <span>{activePhotos.length} Documented Photos</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-semibold">{GALLERY_ITEMS.length - activePhotos.length} Slots Available</span>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-950'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Responsive Gallery Grid: 1 to 2 cols on mobile, 3 to 4 cols on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => {
            const isFailed = failedImages[item.id];
            const isPlaceholderCard = item.isPlaceholder || isFailed;

            if (isPlaceholderCard) {
              return (
                <div
                  key={item.id}
                  className="group relative rounded-2xl border-2 border-dashed border-slate-200/90 hover:border-blue-400 bg-white/70 hover:bg-blue-50/30 p-6 flex flex-col justify-between items-center text-center transition-all duration-300 min-h-[280px] shadow-3xs hover:shadow-sm"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-950 flex items-center justify-center transition-colors">
                    <ImageIcon className="h-6 w-6" />
                  </div>

                  <div className="space-y-1.5 my-auto">
                    <span className="inline-block text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-blue-900 bg-slate-100 group-hover:bg-blue-100/60 px-2 py-0.5 rounded-full">
                      Slot #{index + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-950 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200/60 group-hover:border-blue-200">
                    {item.src.replace('/photos/', '')}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                onClick={() => handleOpenLightbox(item)}
                className="group relative overflow-hidden rounded-2xl bg-slate-900 aspect-4/3 cursor-pointer shadow-xs hover:shadow-xl transition-all duration-500 border border-slate-200/80"
              >
                {/* Image with smooth hover zoom */}
                <img
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  onError={() => {
                    setFailedImages(prev => ({ ...prev, [item.id]: true }));
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:brightness-90"
                />

                {/* Top Floating Badge */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950/70 text-blue-200 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-xs">
                    {item.category}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xs">
                    <Maximize2 className="h-4 w-4" />
                  </div>
                </div>

                {/* Modern Hover Fade Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5 text-white z-10">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 space-y-1">
                    <h3 className="text-sm font-extrabold text-white leading-snug drop-shadow-sm">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-medium">
                      {item.description}
                    </p>
                    {item.date && (
                      <span className="text-[10px] font-bold text-blue-300 inline-flex items-center gap-1 pt-1">
                        <Calendar className="h-3 w-3" /> {item.date}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Developer & Admin Upload Hint Card */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-950 shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <strong className="text-blue-950 font-bold block text-sm">
                Easy Photo Addition System
              </strong>
              <p className="text-slate-600 font-medium mt-0.5">
                To add new laboratory photographs or event archives, simply place your photo as <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-blue-950">lab-gallery-13.jpg</code> inside <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-blue-950">client/public/photos/</code>. The grid automatically loads and scales new images dynamically.
              </p>
            </div>
          </div>
          <div className="shrink-0 font-bold text-blue-950 bg-white border border-blue-200/80 px-3.5 py-1.5 rounded-xl shadow-3xs self-start sm:self-center">
            Static Asset Linked
          </div>
        </div>

      </div>

      {/* Interactive Full-Screen Lightbox Modal */}
      {currentPhoto && activeLightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveLightboxIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setActiveLightboxIndex(null)}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors z-50 focus:outline-none"
            aria-label="Close Lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Left Arrow Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 sm:left-6 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all z-50 hover:scale-105"
            aria-label="Previous Photo"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 sm:right-6 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all z-50 hover:scale-105"
            aria-label="Next Photo"
          >
            <ChevronRight className="h-7 w-7" />
          </button>

          {/* Lightbox Content Container */}
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/40">
              <img
                src={currentPhoto.src}
                alt={currentPhoto.title}
                className="max-h-[75vh] max-w-full object-contain rounded-xl select-none shadow-2xl"
              />
            </div>

            {/* Photo Caption & Metadata Bar */}
            <div className="w-full mt-4 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    {currentPhoto.category}
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    {currentPhoto.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {currentPhoto.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-bold text-slate-400">
                {currentPhoto.date && (
                  <span className="inline-flex items-center gap-1 text-slate-300">
                    <Calendar className="h-3.5 w-3.5" /> {currentPhoto.date}
                  </span>
                )}
                <span className="bg-white/10 px-2.5 py-1 rounded-lg text-white font-mono text-[11px]">
                  {activeLightboxIndex + 1} / {activePhotos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
