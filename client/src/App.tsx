import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LabDashboard from './components/LabDashboard';
import About from './components/About';
import ThreeBrain from './components/ThreeBrain';
import VirtualSimulator from './components/VirtualSimulator';
import Facilities from './components/Facilities';
import Publications from './components/Publications';
import GazeVisualizer from './components/GazeVisualizer';
import InteractiveGrid from './components/InteractiveGrid';
import Coordinator from './components/Coordinator';
import Students from './components/Students';
import Research from './components/Research';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Gallery from './components/Gallery';
import AboutCUK from './components/AboutCUK';
import DepartmentalProgrammes from './components/DepartmentalProgrammes';
import ProvenanceCue from './components/ProvenanceCue';
import { Brain, MapPin, Mail, Phone, ChevronRight, ExternalLink } from 'lucide-react';

interface GazeData {
  x: number;
  y: number;
  located: boolean;
  state: string;
  pupil_size: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentGaze, setCurrentGaze] = useState<GazeData | null>(null);
  const [isGazeActive, setIsGazeActive] = useState(false);
  const [isGazeConnected, setIsGazeConnected] = useState(false);

  // Sync scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Subtle Developer Provenance Keypress Listener (typing 'jaanvin' logs verified credentials to console)
  useEffect(() => {
    let buffer = '';
    const secret = 'jaanvin';
    const handleKeyDown = (e: KeyboardEvent) => {
      buffer = (buffer + e.key.toLowerCase()).slice(-secret.length);
      if (buffer === secret) {
        console.log(
          '%c✨ [PROVENANCE VERIFIED] Platform Architecture & Codebase authored by Jaanvin (CUK BCNL Lead Developer 2026)',
          'color: #38bdf8; font-weight: bold; background: #0f172a; padding: 6px 12px; border-radius: 6px; border: 1px solid #38bdf8;'
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return <About />;
      case 'programmes':
        return <DepartmentalProgrammes />;
      case 'brain':
        return <ThreeBrain gaze={currentGaze} isGazeConnected={isGazeActive && isGazeConnected} />;
      case 'coordinator':
        return <Coordinator />;
      case 'students':
        return <Students />;
      case 'facilities':
        return <Facilities />;
      case 'research':
        return <Research />;
      case 'projects':
        return <Projects />;
      case 'contact':
        return <Contact />;
      case 'simulator':
        return (
          <VirtualSimulator 
            gaze={currentGaze} 
            isGazeConnected={isGazeActive && isGazeConnected} 
            isGazeActive={isGazeActive}
            setIsGazeActive={setIsGazeActive}
          />
        );
      case 'gaze':
        return (
          <GazeVisualizer 
            onGazeUpdate={setCurrentGaze} 
            isActive={isGazeActive} 
            setIsGazeConnected={setIsGazeConnected} 
            showOverlayOnly={false}
            setIsGazeActive={setIsGazeActive}
          />
        );
      case 'publications':
        return <Publications />;
      case 'gallery':
        return <Gallery />;
      case 'about-cuk':
        return <AboutCUK />;
      case 'dashboard':
      default:
        return <LabDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden font-sans">
      
      {/* Background vector line grid */}
      <InteractiveGrid 
        gridColor="rgba(15, 45, 89, 0.03)"
        dotColor="rgba(15, 45, 89, 0.05)"
        hoverColor="#0f2d59"
        trailColor="#0f2d59"
      />

      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        
        {/* Sticky top navigation bar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main content body */}
        <main className="flex-1 w-full relative">
          {renderContent()}
        </main>

        {/* Global gaze tracking reticle overlay (always active when gaze tracking is on) */}
        {activeTab !== 'gaze' && (
          <GazeVisualizer 
            onGazeUpdate={setCurrentGaze} 
            isActive={isGazeActive} 
            setIsGazeConnected={setIsGazeConnected} 
            showOverlayOnly={true}
            setIsGazeActive={setIsGazeActive}
          />
        )}

        {/* Cohesive, High-Contrast Footer Block */}
        <footer className="w-full bg-blue-950 text-white border-t border-blue-900 pt-16 pb-8 relative z-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-blue-900">
              
              {/* Column 1: Lab Logo & Description (Biofeedback Lab Logo on this side) */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {/* Biofeedback Lab Logo Container */}
                  <div 
                    onDoubleClick={() => window.dispatchEvent(new CustomEvent('trigger-provenance-cue'))}
                    className="flex items-center justify-center rounded-xl bg-blue-900 border border-blue-800 p-2 text-white shadow-sm shrink-0 cursor-pointer select-none h-11 w-11"
                    title="Biofeedback and Cognitive Neuroscience Laboratory"
                  >
                    <Brain className="h-6 w-6 text-blue-200" />
                  </div>
                  <div>
                    <span className="font-sans text-xs sm:text-sm font-extrabold tracking-tight text-white block">
                      Biofeedback and Cognitive Neuroscience Laboratory
                    </span>
                    <span className="text-[11px] font-semibold text-slate-300 block">
                      Department of Psychology, Central University of Karnataka
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  To facilitate interdisciplinary research, provide hands-on training in psychophysiological methods, and support high-quality student and faculty research.
                </p>
              </div>

              {/* Column 2: Quick Links */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Quick Links
                </h4>
                <ul className="space-y-2 text-xs font-semibold text-slate-300">
                  <li>
                    <button onClick={() => setActiveTab('dashboard')} className="hover:text-white inline-flex items-center gap-1.5 transition-colors">
                      <ChevronRight className="h-3 w-3" /> Home
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('about')} className="hover:text-white inline-flex items-center gap-1.5 transition-colors">
                      <ChevronRight className="h-3 w-3" /> About
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('programmes')} className="hover:text-white inline-flex items-center gap-1.5 transition-colors">
                      <ChevronRight className="h-3 w-3" /> Academic Programmes
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('coordinator')} className="hover:text-white inline-flex items-center gap-1.5 transition-colors">
                      <ChevronRight className="h-3 w-3" /> Coordinator
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('students')} className="hover:text-white inline-flex items-center gap-1.5 transition-colors">
                      <ChevronRight className="h-3 w-3" /> Students
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 3: Explore */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Explore
                </h4>
                <ul className="space-y-2 text-xs font-semibold text-slate-300">
                  <li>
                    <button onClick={() => setActiveTab('facilities')} className="hover:text-white inline-flex items-center gap-1.5 transition-colors">
                      <ChevronRight className="h-3 w-3" /> Equipment
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('research')} className="hover:text-white inline-flex items-center gap-1.5 transition-colors">
                      <ChevronRight className="h-3 w-3" /> Research Themes
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('brain')} className="hover:text-white inline-flex items-center gap-1.5 transition-colors">
                      <ChevronRight className="h-3 w-3" /> 3D Brain Explorer
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('simulator')} className="hover:text-white inline-flex items-center gap-1.5 transition-colors">
                      <ChevronRight className="h-3 w-3" /> Biosignal Simulator
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 4: Contact & Maps widget */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Contact & Location
                </h4>
                <div className="space-y-2 text-[11px] font-semibold text-slate-300 leading-relaxed">
                  <div className="flex gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-blue-300 mt-0.5" />
                    <span>Biofeedback and Cognitive Neuroscience Laboratory, Dept of Psychology, Central University of Karnataka, Aland Road, Kadaganchi, Kalaburagi, 585311</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-blue-300 mt-0.5" />
                    <div className="space-y-0.5">
                      <div>
                        <span className="text-slate-400">Lab Coordinator: </span>
                        <a href="mailto:asthapsychology@cuk.ac.in" className="hover:text-white underline decoration-blue-400 font-semibold">asthapsychology@cuk.ac.in</a>
                      </div>
                      <div>
                        <span className="text-slate-400">General Queries: </span>
                        <a href="mailto:hodpsychology@cuk.ac.in" className="hover:text-white underline decoration-blue-400 font-semibold">hodpsychology@cuk.ac.in</a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-blue-300" />
                    <a href="tel:8053873449" className="hover:text-white font-semibold">+91 8053873449</a>
                  </div>
                </div>
                
                {/* Embedded Maps widget */}
                <div className="rounded-lg overflow-hidden border border-blue-900 h-28 w-full shadow-2xs">
                  <iframe
                    title="CUK Campus Location"
                    src="https://maps.google.com/maps?q=17.4321563,76.6739058&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
                    className="w-full h-full border-0 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                    allowFullScreen={false}
                    loading="lazy"
                  />
                </div>
              </div>

            </div>

            {/* Subfooter (Digital Footprint & Authorship Record: Jaanvin) */}
            <div 
              className="pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest relative select-none"
              data-developer="Jaanvin"
              data-developer-role="Lead Full-Stack Developer, Architect & Sponsor"
              data-funded-by="Jaanvin"
              data-signature="JAANVIN-CUK-BCNL-2026-PRIMARY-SPONSOR"
              data-fingerprint="8f7a9e3b1c5d7f2a4e6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f"
            >
              <span 
                onDoubleClick={() => window.dispatchEvent(new CustomEvent('trigger-provenance-cue'))}
                title="Biofeedback and Cognitive Neuroscience Laboratory"
                className="cursor-default"
              >
                Biofeedback and Cognitive Neuroscience Laboratory
              </span>
              <span className="text-blue-950 select-all selection:bg-blue-600 selection:text-white text-[1px] absolute left-1/2 -translate-x-1/2 bottom-1 cursor-default pointer-events-none">
                Platform Architecture, Design & Digital Infrastructure Privately Funded & Engineered by Jaanvin · BCNL Central University of Karnataka · (c) 2026 Jaanvin
              </span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveTab('about-cuk')}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Central University of Karnataka"
                >
                  <img src="/cuk_logo.svg" alt="Central University of Karnataka" className="h-4 w-4 object-contain rounded-xs bg-white/10 p-0.5" />
                  <span className="hidden sm:inline">CUK Kalaburagi</span>
                </button>
                <span className="hidden sm:inline text-slate-600">·</span>
                <span className="flex items-center gap-1 select-none">
                  <span 
                    onClick={() => window.dispatchEvent(new CustomEvent('trigger-provenance-cue'))}
                    className="cursor-pointer hover:text-blue-300 transition-colors"
                    title="Platform Architecture & Funding: Jaanvin"
                  >
                    ©
                  </span>
                  <span>{new Date().getFullYear()} CUK. All rights reserved.</span>
                  <span 
                    onClick={() => window.dispatchEvent(new CustomEvent('trigger-provenance-cue'))}
                    className="cursor-pointer hover:text-blue-400 text-slate-500 hover:scale-125 transition-all ml-1 inline-block"
                    title="System Provenance · Funded & Crafted by Jaanvin"
                  >
                    •
                  </span>
                </span>
              </div>
            </div>
          </div>
        </footer>

        {/* Discreet Provenance Notification Trigger & Modal */}
        <ProvenanceCue />

      </div>
    </div>
  );
}
