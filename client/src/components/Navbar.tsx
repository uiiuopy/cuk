import React, { useEffect, useState } from 'react';
import { Brain, Menu, X, Radio } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'connecting' | 'connected' | 'offline' | 'error'>('connecting');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/health');
        if (res.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch (err) {
        setApiStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'coordinator', label: 'Coordinator' },
    { id: 'students', label: 'Students' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'research', label: 'Research' },
    { id: 'projects', label: 'Projects' },
    { id: 'publications', label: 'Publications' },
    { id: 'brain', label: '3D Brain' },
    { id: 'simulator', label: 'Simulator' },
    { id: 'gaze', label: 'Eye Tracking' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' },
    { id: 'about-cuk', label: 'About CUK' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex max-w-7xl min-h-[4.5rem] py-2 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer select-none shrink-0" onClick={() => setActiveTab('dashboard')}>
          <div className="flex items-center justify-center rounded-xl bg-blue-950 p-2.5 text-white shadow-sm transition-transform hover:scale-105 shrink-0">
            <Brain className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-xs sm:text-sm md:text-base font-extrabold tracking-tight text-blue-950 leading-snug">
              Biofeedback and Cognitive Neuroscience Laboratory
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 leading-tight">
              Department of Psychology, Central University of Karnataka
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-0.5 xl:gap-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2 py-1.5 xl:px-3 xl:py-2 text-xs xl:text-sm font-bold tracking-wide transition-colors rounded-lg ${
                activeTab === item.id
                  ? 'text-blue-950 bg-slate-100 font-extrabold shadow-2xs'
                  : 'text-slate-600 hover:text-blue-950 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          
          {/* API Health indicator */}
          <div className="ml-3 flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-[9px] xl:text-[10px] font-bold tracking-wider text-slate-500 shadow-3xs">
            <Radio className={`h-3 w-3 ${apiStatus === 'connected' ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
            <span className="hidden xl:inline">API: {apiStatus.toUpperCase()}</span>
            <span className="xl:hidden">API</span>
            <span className={`h-2 w-2 xl:h-2.5 xl:w-2.5 rounded-full ${
              apiStatus === 'connected' ? 'bg-emerald-500' :
              apiStatus === 'connecting' ? 'bg-amber-400' : 'bg-rose-500'
            }`} />
          </div>
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center gap-2 xl:hidden">
          {/* API Health indicator for Mobile */}
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-500">
            <span className={`h-1.5 w-1.5 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>API</span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-950 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-md ${
                  activeTab === item.id
                    ? 'text-blue-950 bg-slate-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-950'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
