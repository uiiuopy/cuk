import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Sparkles, 
  Award, 
  ArrowRight,
  Landmark,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { fetchSheetData } from '../utils/googleSheets';
import fallbackProgrammes from '../data/programmes.json';

export interface Programme {
  id?: string;
  title: string;
  level: string;
  duration: string;
  eligibility: string;
  overview: string;
  coreAreas: string[];
  labIntegration: string;
  admissionProcess: string;
}

export default function DepartmentalProgrammes() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'doctoral' | 'postgraduate' | 'undergraduate' | 'training'>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try fetching 'Departmental Programs' tab first
        let data = await fetchSheetData('Departmental Programs').catch(() => []);
        
        // If empty, try 'Departmental Programmes' or 'Programmes'
        if (!data || data.length === 0) {
          data = await fetchSheetData('Departmental Programmes').catch(() => []);
        }
        if (!data || data.length === 0) {
          data = await fetchSheetData('Programmes').catch(() => []);
        }

        if (data && data.length > 0 && (data[0].Title || data[0].title || data[0].Programme || data[0].Program)) {
          const parsed: Programme[] = data.map((item, index) => {
            const rawAreas = item['Core Areas'] || item.coreAreas || item.CoreAreas || item.Curriculum || item.Specializations || '';
            const coreAreas = Array.isArray(rawAreas) 
              ? rawAreas 
              : rawAreas.split(/[\n,;•]+/).map((s: string) => s.trim()).filter(Boolean);

            return {
              id: item.id || `prog_${index}`,
              title: item.Title || item.title || item.Programme || item.Program || item.Name || 'Academic Programme',
              level: item.Level || item.level || item.Degree || 'Degree Programme',
              duration: item.Duration || item.duration || 'Full-Time',
              eligibility: item.Eligibility || item.eligibility || item.Criteria || '',
              overview: item.Overview || item.overview || item.Description || item.description || '',
              coreAreas: coreAreas.length > 0 ? coreAreas : [
                'Cognitive Neuroscience & Psychophysiology',
                'Research Methodology & Psychological Testing',
                'Advanced Signal Processing & Applied Psychology'
              ],
              labIntegration: item['Lab Integration'] || item.labIntegration || item.LabIntegration || item['Laboratory Integration'] || '',
              admissionProcess: item['Admission Process'] || item.admissionProcess || item.AdmissionProcess || item.Admission || ''
            };
          });
          setProgrammes(parsed);
        } else {
          setProgrammes(fallbackProgrammes as Programme[]);
        }
      } catch (err) {
        console.warn('Failed to load programmes from Google Sheets, using fallback:', err);
        setProgrammes(fallbackProgrammes as Programme[]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getLevelBadgeClass = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('doctor') || l.includes('ph.d') || l.includes('phd')) {
      return 'bg-purple-100 text-purple-900 border-purple-200';
    }
    if (l.includes('postgrad') || l.includes('m.sc') || l.includes('master')) {
      return 'bg-blue-100 text-blue-900 border-blue-200';
    }
    if (l.includes('undergrad') || l.includes('b.sc') || l.includes('nep')) {
      return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    }
    return 'bg-amber-100 text-amber-900 border-amber-200';
  };

  const filteredProgrammes = programmes.filter(p => {
    if (selectedFilter === 'all') return true;
    const l = (p.level + ' ' + p.title).toLowerCase();
    if (selectedFilter === 'doctoral') return l.includes('ph.d') || l.includes('doctor');
    if (selectedFilter === 'postgraduate') return l.includes('m.sc') || l.includes('master') || l.includes('postgrad');
    if (selectedFilter === 'undergraduate') return l.includes('b.sc') || l.includes('undergrad') || l.includes('nep');
    if (selectedFilter === 'training') return l.includes('train') || l.includes('work') || l.includes('hands-on');
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Top Section Header */}
      <div className="mb-10 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-blue-950 mb-2">
              <GraduationCap className="h-6 w-6 text-blue-950" />
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Departmental Academic Programmes
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-3xl">
              Academic curricula offered by the Department of Psychology, Central University of Karnataka, integrating foundational theory with hands-on cognitive neuroscience and biofeedback laboratory practicums.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200/80">
              <Landmark className="h-3.5 w-3.5" />
              NEP-2020 Aligned
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter by Level:</span>
          {[
            { id: 'all', label: 'All Programmes' },
            { id: 'doctoral', label: 'Doctoral (Ph.D.)' },
            { id: 'postgraduate', label: 'Postgraduate (M.Sc.)' },
            { id: 'undergraduate', label: 'Undergraduate (B.Sc.)' },
            { id: 'training', label: 'Workshops & Training' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedFilter === tab.id
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Highlight Banner */}
      <div className="mb-10 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-900/60 border border-blue-700/50 text-blue-300 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Curricular-Laboratory Synergy
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-white mb-3">
            Theory Grounded in Empirical Neurotechnology
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            All academic degree programmes within the Department of Psychology are structured with active laboratory immersion. From basic reaction-time and psychophysics experiments at the undergraduate tier to 64-channel electroencephalography (EEG/ERP) signal decomposition and multi-channel biofeedback calibration at the master’s and doctoral levels, students acquire rigorous scientific competency.
          </p>
        </div>
      </div>

      {/* Programmes List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 font-semibold text-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-950 mr-2" />
          Loading academic programmes...
        </div>
      ) : (
        <div className="space-y-8">
          {filteredProgrammes.map((prog, idx) => (
            <div 
              key={prog.id || idx}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all"
            >
              {/* Card Header Banner */}
              <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${getLevelBadgeClass(prog.level)}`}>
                      {prog.level}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-3xs">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {prog.duration}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                    {prog.title}
                  </h3>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Department</span>
                    <span className="text-xs font-bold text-blue-950">Psychology, CUK</span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-950 text-white flex items-center justify-center shadow-xs">
                    <BookOpen className="h-5 w-5 text-blue-200" />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Overview */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Programme Overview
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {prog.overview}
                  </p>
                </div>

                {/* Eligibility & Admission Process Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prog.eligibility && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        Eligibility Criteria
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {prog.eligibility}
                      </p>
                    </div>
                  )}

                  {prog.admissionProcess && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        <FileCheck className="h-4 w-4 text-blue-600" />
                        Admission Pathway
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {prog.admissionProcess}
                      </p>
                    </div>
                  )}
                </div>

                {/* Core Areas */}
                {prog.coreAreas && prog.coreAreas.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-blue-950" />
                      Key Curriculum Vectors & Focus Modules
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {prog.coreAreas.map((area, aIdx) => (
                        <div 
                          key={aIdx}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50/40 border border-blue-100/70 text-xs font-semibold text-slate-800"
                        >
                          <CheckCircle2 className="h-4 w-4 text-blue-950 shrink-0 mt-0.5" />
                          <span>{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lab Integration Highlight */}
                {prog.labIntegration && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/5 via-blue-900/5 to-slate-900/5 border border-blue-900/20">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-950 mb-1.5">
                      <Activity className="h-4 w-4 text-blue-950 animate-pulse" />
                      Biofeedback & Neuroscience Lab Integration
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {prog.labIntegration}
                    </p>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Information & Admission Guide Callout */}
      <div className="mt-12 p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="text-base font-extrabold text-slate-900">
            Admissions & Prospective Inquiries
          </h4>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            For academic syllabus documents, CUET cutoffs, doctoral admission notifications, and laboratory internship opportunities, visit the Central University of Karnataka official portal or reach out directly to the Department of Psychology.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a 
            href="https://www.cuk.ac.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-950 text-white rounded-xl text-xs font-bold hover:bg-blue-900 transition-colors shadow-xs"
          >
            <span>Visit CUK Official Portal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
