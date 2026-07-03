import React, { useState, useEffect } from 'react';
import { Target, Eye, BookOpen, Cpu, Activity, Brain, ArrowRight, ShieldCheck, Settings, Move, Compass, CheckCircle } from 'lucide-react';
import { fetchSheetData, getDirectDriveUrl } from '../utils/googleSheets';
import InfiniteCanvas from './InfiniteCanvas';
import InteractiveBrainSVG from './InteractiveBrainSVG';

interface GalleryImage {
  id: string;
  path: string;
  label: string;
  left: string;
  top: string;
}

interface EquipmentItem {
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

interface LabDashboardProps {
  setActiveTab: (tab: string) => void;
}

export default function LabDashboard({ setActiveTab }: LabDashboardProps) {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  const defaultGalleryImages: GalleryImage[] = [
    { id: '1', path: '/src/assets/photo1.jpg', label: 'Primary EEG Biosensing Bay', left: '50px', top: '40px' },
    { id: '2', path: '/src/assets/photo2.jpg', label: 'Virtual Reality Suite', left: '440px', top: '100px' },
    { id: '3', path: '/src/assets/photo3.jpg', label: 'Computing Cluster', left: '120px', top: '270px' },
    { id: '4', path: '/src/assets/photo4.jpg', label: 'EEG Preparation Room', left: '520px', top: '290px' },
    { id: '5', path: '/src/assets/photo5.jpg', label: 'Eye-Tracking Calibration Bay', left: '850px', top: '50px' },
    { id: '6', path: '/src/assets/photo6.jpg', label: 'Autonomic Sensor Bay', left: '900px', top: '260px' }
  ];

  const equipmentList: EquipmentItem[] = [
    {
      name: 'Brain Products 64-Channel EEG',
      desc: 'High-density electroencephalography system featuring active wet gel electrodes to record electrical brain activity with millisecond temporal resolution.',
      icon: Brain
    },
    {
      name: 'EMG (Electromyography)',
      desc: 'Muscle electrical potential sensors measuring muscle contraction dynamics, motor unit recruitment, and physiological stress responses.',
      icon: Activity
    },
    {
      name: 'HRV (Heart Rate Variability)',
      desc: 'Autonomic cardiac regulation index extracted from high-resolution electrocardiograms to evaluate sympathetic-parasympathetic balance.',
      icon: Target
    },
    {
      name: 'GSR (Galvanic Skin Response)',
      desc: 'Electrodermal activity measurement reflecting sympathetic nervous system arousal and sweat gland activation during emotional response.',
      icon: Cpu
    },
    {
      name: 'EOG (Electrooculography)',
      desc: 'Electrode system measuring the resting potential of the retina to track vertical/horizontal eye movements and blink rates.',
      icon: Eye
    },
    {
      name: 'BVP (Blood Volume Pulse)',
      desc: 'Photoplethysmography sensor capturing vascular blood flow fluctuations to determine heart rate and peripheral vasoconstriction.',
      icon: ShieldCheck
    }
  ];

  const inquiryAreas = [
    'Cognitive Neuroscience',
    'Psychophysiology',
    'Biofeedback',
    'Neuropsychology',
    'Emotion Regulation',
    'Attention & Memory',
    'Executive Functions',
    'Stress & Resilience',
    'EEG & ERP Research',
    'Brain-Behaviour Relationships'
  ];

  const collaborations = [
    'EEG recording services',
    'HRV and psychophysiological assessments',
    'Joint research initiatives',
    'Student internship placements',
    'Technical workshops',
    'Consultancy services'
  ];

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await fetchSheetData('Gallery');
        const normalized = data.map((row, idx) => ({
          id: `gallery_${idx}`,
          path: row.Path || row.URL || '',
          label: row.Label || '',
          left: row.Left || `${50 + (idx % 3) * 390}px`,
          top: row.Top || `${40 + Math.floor(idx / 3) * 250}px`
        }));
        setGallery(normalized.length > 0 ? normalized : defaultGalleryImages);
      } catch (err) {
        console.warn("Failed to fetch gallery from Google Sheets, using fallback:", err);
        setGallery(defaultGalleryImages);
      }
    };
    fetchGallery();
  }, []);

  return (
    <div className="space-y-16 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Hero Welcome / About Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-2xs">
        
        {/* Hero Left Content */}
        <div className="lg:col-span-7 space-y-6">
          <span className="text-xs uppercase font-extrabold tracking-widest text-blue-950 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100">
            ✨ Department of Psychology · CUK
          </span>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Biofeedback and{' '}
            <span className="text-blue-950">Cognitive Neuroscience</span>{' '}
            Laboratory
          </h1>
          
          <p className="text-base text-slate-600 leading-relaxed max-w-2xl font-medium">
            The Biofeedback and Cognitive Neuroscience Laboratory is dedicated to research, teaching, and training in cognitive neuroscience, psychophysiology, and biofeedback. The laboratory supports interdisciplinary research using state-of-the-art physiological recording systems for understanding human cognition, emotion, and behaviour.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-4">
            <button
              onClick={() => setActiveTab('about')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-950 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3.5 shadow-sm transition-all"
            >
              Explore Laboratory <ArrowRight className="h-4 w-4" />
            </button>
            
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <button onClick={() => setActiveTab('research')} className="hover:text-blue-950 hover:underline">
                Research
              </button>
              <span>·</span>
              <button onClick={() => setActiveTab('facilities')} className="hover:text-blue-950 hover:underline">
                Equipment
              </button>
              <span>·</span>
              <button onClick={() => setActiveTab('contact')} className="hover:text-blue-950 hover:underline">
                Contact
              </button>
            </div>
          </div>
        </div>

        {/* Hero Right Visual: Brain Highlights */}
        <div className="lg:col-span-5 flex justify-center items-center bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <div className="w-full max-w-sm">
            <InteractiveBrainSVG />
          </div>
        </div>

      </section>

      {/* Core Pillars: Vision, Mission, Objectives */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Vision */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs hover:shadow-sm transition-all hover:border-slate-300 flex flex-col justify-between">
          <div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 w-12 h-12 flex items-center justify-center text-blue-950 mb-6 shrink-0">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">Vision</h3>
            <p className="text-xs leading-relaxed text-slate-600 font-medium">
              To become a leading centre for translational cognitive neuroscience and biofeedback research in India.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs hover:shadow-sm transition-all hover:border-slate-300 flex flex-col justify-between">
          <div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 w-12 h-12 flex items-center justify-center text-blue-950 mb-6 shrink-0">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">Mission</h3>
            <p className="text-xs leading-relaxed text-slate-600 font-medium">
              Advance scientific understanding of cognition, emotion and behaviour through rigorous psychophysiological research and training.
            </p>
          </div>
        </div>

        {/* Objectives */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs hover:shadow-sm transition-all hover:border-slate-300 flex flex-col justify-between">
          <div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 w-12 h-12 flex items-center justify-center text-blue-950 mb-6 shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">Objectives</h3>
            <p className="text-xs leading-relaxed text-slate-600 font-medium">
              Foster interdisciplinary research, train next-generation scientists, and produce open, reproducible findings.
            </p>
          </div>
        </div>

      </section>

      {/* Facilities/Equipment Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              State-of-the-Art Equipment
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              High-fidelity physiological acquisition systems deployed in our experiments.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('facilities')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-950 hover:text-slate-700 hover:underline"
          >
            View all equipment <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipmentList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-blue-950 transition-all flex gap-4 items-start"
              >
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-blue-950 shrink-0 mt-0.5">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">{item.name}</h3>
                  <p className="text-[11px] text-slate-500 leading-normal">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Areas of Inquiry */}
      <section className="space-y-6 bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Areas of Inquiry
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Key scientific domains and clinical questions investigated by our scholars.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {inquiryAreas.map((area, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-blue-950 cursor-default transition-colors"
            >
              <Compass className="h-3.5 w-3.5 text-blue-950" />
              {area}
            </span>
          ))}
        </div>
      </section>

      {/* Global CTA Banner: Collaborate */}
      <section className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <h3 className="text-2xl font-extrabold tracking-tight text-white">
            Collaborate with the laboratory
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-semibold">
            We provide EEG recording services, HRV psychophysiological assessments, student training internships, and custom neuro-behavioral workshop consulting.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <button
            onClick={() => setActiveTab('contact')}
            className="inline-flex items-center gap-2 rounded-xl bg-white text-blue-950 font-bold text-xs uppercase tracking-wider py-3.5 px-6 shadow-sm hover:bg-slate-100 transition-colors"
          >
            Get in touch <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Laboratory Gallery Drag Canvas */}
      {gallery.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                Laboratory Gallery
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Visual impressions of our experimental bays, sensory equipment, and computing clusters.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full w-fit">
              <Move className="h-3.5 w-3.5 text-blue-950 animate-bounce" /> Drag canvas to explore
            </div>
          </div>

          <div className="relative h-112 w-full bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing">
            {gallery.map((image) => {
              // Direct drive URL utility call
              const directUrl = getDirectDriveUrl(image.path);
              return (
                <div 
                  key={image.id} 
                  className="absolute pointer-events-none select-none rounded-xl overflow-hidden bg-white border border-slate-200 p-2 shadow-xs group"
                  style={{ left: image.left, top: image.top, width: '320px', height: '210px' }}
                >
                  <div className="relative w-full h-full overflow-hidden rounded-lg bg-slate-50 flex items-center justify-center">
                    <img
                      src={directUrl || '/favicon.svg'}
                      alt={image.label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/60 backdrop-blur-xs p-2 text-white text-[10px] font-bold text-center">
                      {image.label}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="absolute inset-0 z-10">
              <InfiniteCanvas />
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
