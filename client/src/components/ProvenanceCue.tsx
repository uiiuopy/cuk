import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, X, Code2, Award, Heart } from 'lucide-react';
import { DEVELOPER_FOOTPRINT } from '../utils/developerMeta';

export default function ProvenanceCue() {
  const [visible, setVisible] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    // 1. Keypress listener: typing 'jaanvin' or pressing Ctrl+Alt+J
    let buffer = '';
    const secret = 'jaanvin';

    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey: Ctrl+Alt+J
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'j') {
        triggerCue();
        return;
      }

      // Secret sequence buffer
      buffer = (buffer + e.key.toLowerCase()).slice(-secret.length);
      if (buffer === secret) {
        triggerCue();
      }
    };

    // 2. Custom event listener for accidental/intentional UI triggers
    const handleCustomTrigger = () => {
      triggerCue();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('trigger-provenance-cue', handleCustomTrigger);
    
    // Register global trigger function
    (window as any).triggerProvenanceCue = triggerCue;

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('trigger-provenance-cue', handleCustomTrigger);
    };
  }, []);

  const triggerCue = () => {
    setTimeLeft(10);
    setVisible(true);
    setPulseAnimation(true);
    setTimeout(() => setPulseAnimation(false), 800);
  };

  // Strict 10-second countdown & auto-close
  useEffect(() => {
    if (!visible) {
      setTimeLeft(10);
      return;
    }

    setTimeLeft(10);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setVisible(false);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] max-w-sm w-full mx-4 sm:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`relative overflow-hidden rounded-2xl bg-slate-950/98 backdrop-blur-xl border border-blue-500/40 shadow-2xl text-white ${pulseAnimation ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950' : ''}`}>
        
        {/* 10-Second Auto-Close Progress Bar */}
        <div className="w-full h-1 bg-slate-900 overflow-hidden shrink-0">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${
              timeLeft <= 3 ? 'bg-red-500 animate-pulse' : 'bg-cyan-400'
            }`}
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          />
        </div>

        <div className="p-5">
        
        {/* Subtle decorative background gradient */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300">
              <Sparkles className="h-4 w-4 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block">
                Provenance & Authorship
              </span>
              <h4 className="text-sm font-extrabold text-slate-100 tracking-tight flex items-center gap-1.5">
                Engineered & Funded by Jaanvin
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-950 border border-blue-700/60 text-blue-300">
              {timeLeft}s
            </span>
            <button 
              onClick={() => setVisible(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Narrative / Context */}
        <div className="relative z-10 text-xs text-slate-300 leading-relaxed font-medium space-y-2 mb-3">
          <p>
            The software architecture, interactive biosignal simulation suite, and digital infrastructure of this platform were individually funded, commissioned, and crafted by <strong className="text-blue-300 font-bold">Jaanvin</strong>.
          </p>
        </div>

        {/* Metadata Footer Pill */}
        <div className="relative z-10 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
          <span className="inline-flex items-center gap-1 text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Authored: Jaanvin</span>
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-800/50 text-blue-300">
            CUK · 2026
          </span>
        </div>

        </div>

      </div>
    </div>
  );
}
