import React, { useEffect, useState } from 'react';
import { 
  Brain, 
  Menu, 
  X, 
  Radio, 
  Home, 
  Info, 
  Users, 
  GraduationCap, 
  Activity, 
  BookOpen, 
  Layers, 
  FileText, 
  Sliders, 
  Eye, 
  Image as ImageIcon, 
  Mail, 
  Landmark, 
  ChevronRight,
  Award
} from 'lucide-react';

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
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'about', label: 'About Lab', icon: Info },
    { id: 'programmes', label: 'Programmes', icon: Award },
    { id: 'coordinator', label: 'Coordinators', icon: Users },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'facilities', label: 'Facilities', icon: Activity },
    { id: 'research', label: 'Research', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'publications', label: 'Publications', icon: FileText },
    { id: 'simulator', label: 'Simulator', icon: Sliders, badge: 'Live' },
    { id: 'gaze', label: 'Eye Tracking', icon: Eye, badge: 'Live' },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'about-cuk', label: 'About CUK', icon: Landmark }
  ];

  const categories = [
    {
      title: 'General & Overview',
      items: ['dashboard', 'about', 'programmes', 'about-cuk', 'contact']
    },
    {
      title: 'Our Team',
      items: ['coordinator', 'students']
    },
    {
      title: 'Research & Infrastructure',
      items: ['facilities', 'research', 'projects', 'publications']
    },
    {
      title: 'Interactive Tools & Media',
      items: ['simulator', 'gaze', 'gallery']
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all duration-300">
      
      {/* Tier 1: Primary Brand & Institution Header */}
      <div className="border-b border-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 gap-4">
          
          {/* Brand Logo & Academic Identity */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none group min-w-0" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="flex items-center justify-center rounded-xl bg-blue-950 p-2 sm:p-2.5 text-white shadow-md transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-900 shrink-0">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-blue-200" />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="font-sans text-xs sm:text-base md:text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-950 transition-colors leading-tight sm:leading-snug">
                Biofeedback and Cognitive Neuroscience Laboratory
              </h1>
              <p className="text-[9.5px] sm:text-xs font-semibold text-slate-500 tracking-wide leading-tight flex flex-wrap items-center gap-1 sm:gap-1.5 mt-0.5">
                <span>Department of Psychology</span>
                <span className="text-slate-300">·</span>
                <span className="text-blue-950 font-bold">Central University of Karnataka</span>
              </p>
            </div>
          </div>

          {/* Right Header Status & Action Area */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Live API Health status badge */}
            <div 
              title={`Backend Service: ${apiStatus.toUpperCase()}`}
              className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-3xs"
            >
              <Radio className={`h-3.5 w-3.5 ${apiStatus === 'connected' ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-700">
                API: {apiStatus}
              </span>
              <span className={`h-2 w-2 rounded-full ${
                apiStatus === 'connected' ? 'bg-emerald-500 ring-2 ring-emerald-200' :
                apiStatus === 'connecting' ? 'bg-amber-400' : 'bg-rose-500'
              }`} />
            </div>

            {/* Mobile / Tablet Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden inline-flex items-center justify-center rounded-xl p-2 text-slate-700 hover:bg-slate-100 hover:text-blue-950 border border-slate-200 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Tier 2: Dedicated Navigation Ribbon (Desktop) */}
      <div className="hidden xl:block bg-slate-50/60 border-t border-slate-100/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-start gap-1 py-1.5 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-tight rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-950 text-white shadow-xs'
                      : 'text-slate-600 hover:text-blue-950 hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-200' : 'text-slate-500 group-hover:text-blue-950'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full tracking-wider ${
                      isActive 
                        ? 'bg-blue-800 text-blue-100' 
                        : 'bg-blue-100 text-blue-900 group-hover:bg-blue-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer / Categorized Menu Panel */}
      {isOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-6 shadow-xl max-h-[calc(100vh-5rem)] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-6">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
                  {cat.title}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {cat.items.map((itemId) => {
                    const item = navItems.find((n) => n.id === itemId);
                    if (!item) return null;
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-3.5 py-2.5 text-xs font-bold rounded-xl transition-colors ${
                          isActive
                            ? 'bg-blue-950 text-white shadow-xs'
                            : 'text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-blue-950'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`h-4 w-4 ${isActive ? 'text-blue-200' : 'text-slate-500'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                            isActive ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-900'
                          }`}>
                            {item.badge}
                          </span>
                        ) : (
                          <ChevronRight className={`h-3.5 w-3.5 opacity-50 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Mobile API Status Info */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-2">
              <span className="font-semibold">Lab API Backend:</span>
              <span className="font-bold uppercase text-blue-950 flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                {apiStatus}
              </span>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
