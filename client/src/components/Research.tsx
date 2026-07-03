import React, { useState, useEffect } from 'react';
import { BookOpen, HelpCircle, Activity, Brain, Eye, ShieldAlert } from 'lucide-react';
import { fetchSheetData } from '../utils/googleSheets';
import fallbackResearch from '../data/research.json';

interface ResearchTheme {
  Theme: string;
  Description: string;
  KeyMetrics?: string;
}

export default function Research() {
  const [themes, setThemes] = useState<ResearchTheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSheetData('Research');
        if (data && data.length > 0) {
          const normalized = data.map(item => ({
            Theme: item.Theme || item.theme || '',
            Description: item.Description || item.description || '',
            KeyMetrics: item.KeyMetrics || item.keyMetrics || item.Metrics || item.metrics || ''
          }));
          setThemes(normalized);
        } else {
          setThemes(fallbackResearch as ResearchTheme[]);
        }
      } catch (err) {
        console.warn('Failed to load research data, falling back:', err);
        setThemes(fallbackResearch as ResearchTheme[]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-10 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 text-blue-950 mb-2">
          <BookOpen className="h-6 w-6" />
          <h2 className="text-2xl font-extrabold tracking-tight">Research Themes & Scope</h2>
        </div>
        <p className="text-sm text-slate-600">
          Core physiological and neuroscientific vectors investigated inside our laboratory environment.
        </p>
      </div>

      {/* Multi-Method Approach Hero Card */}
      <div className="mb-10 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 max-w-4xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300 bg-blue-900/50 px-2.5 py-1 rounded-full border border-blue-800/40 mb-4 inline-block">
            Core Experimental Philosophy
          </span>
          <h3 className="text-2xl font-extrabold tracking-tight text-white mb-3">
            The Multi-Method Integrative Approach
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Our laboratory leverages a concurrent, multi-layered acquisition architecture. By mapping cortical oscillations (via high-density EEG) alongside autonomic nervous system arousal (via electrocardiogram HRV, blood volume pulse, and galvanic skin response) and high-speed oculomotor dynamics (via Tobii gaze tracing), we construct a comprehensive, multi-dimensional profile of cognitive processing, workload, and emotional regulation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-850">
            <div className="flex items-start gap-3">
              <div className="bg-white/10 p-2 rounded-lg text-blue-350 mt-0.5">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">Central Processing</h4>
                <p className="text-[11px] text-slate-400">Cortical oscillations, power spectral bands, and ERPs.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white/10 p-2 rounded-lg text-emerald-350 mt-0.5">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">Autonomic Response</h4>
                <p className="text-[11px] text-slate-400">HRV cardiac tone, electrodermal reactivity, & respiration.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white/10 p-2 rounded-lg text-purple-350 mt-0.5">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">Oculomotor Tracing</h4>
                <p className="text-[11px] text-slate-400">Saccadic patterns, fixation indexes, and pupil dilation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid listing of research vectors */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 font-semibold text-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-950 mr-2" />
          Loading research vectors...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {themes.map((theme, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center gap-2 text-blue-950 mb-3 border-b border-slate-100 pb-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-950" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">
                    {theme.Theme}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6 font-sans">
                  {theme.Description}
                </p>
              </div>

              {theme.KeyMetrics && (
                <div className="border-t border-slate-100 pt-4 bg-slate-50/50 p-4 rounded-xl border">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-blue-950" />
                    Primary Biomarkers & Metrics
                  </h4>
                  <p className="text-xs text-blue-950 font-semibold leading-relaxed">
                    {theme.KeyMetrics}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
