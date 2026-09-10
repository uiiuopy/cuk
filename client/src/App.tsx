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

  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return <About />;
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
              
              {/* Column 1: Lab Logo & Description */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-lg bg-white p-1.5 text-blue-950 shadow-sm">
                    <Brain className="h-6 w-6" />
                  </div>
                  <span className="font-sans text-lg font-extrabold tracking-wider">
                    BCNL CUK
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  The Biofeedback and Cognitive Neuroscience Laboratory at the Central University of Karnataka is dedicated to translational psychophysiological research and training.
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
                    <span>Psychophysiology Lab, Dept of Psychology, Central University of Karnataka, Aland Road, Kadaganchi, Kalaburagi, 585311</span>
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

            {/* Subfooter */}
            <div className="pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Biofeedback and Cognitive Neuroscience Laboratory</span>
              <span>© {new Date().getFullYear()} CUK. All rights reserved.</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
