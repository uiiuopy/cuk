import React, { useState, useEffect } from 'react';
import { Mail, BookOpen, Award, ExternalLink, GraduationCap, X, Heart, Sparkles } from 'lucide-react';
import { fetchSheetData, getDirectDriveUrl } from '../utils/googleSheets';
import fallbackFaculty from '../data/faculty.json';

interface FacultyPerson {
  Name: string;
  Designation: string;
  Specialization: string;
  Email: string;
  'Photo URL'?: string;
  Bio?: string;
  ORCID?: string;
  Scholar?: string;
  ResearchGate?: string;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Coordinator() {
  const [faculty, setFaculty] = useState<FacultyPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [showRomateModal, setShowRomateModal] = useState(false);
  const [romateClicks, setRomateClicks] = useState(0);

  // Hidden Keypress & Trigger Listener for Prof. Romate John tribute
  useEffect(() => {
    let keyBuffer = '';
    const secret = 'romate';

    const handleKey = (e: KeyboardEvent) => {
      // Shortcut: Ctrl+Alt+R
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'r') {
        setShowRomateModal(true);
        return;
      }
      keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-secret.length);
      if (keyBuffer === secret) {
        setShowRomateModal(true);
      }
    };

    window.addEventListener('keydown', handleKey);
    (window as any).showFoundingTribute = () => setShowRomateModal(true);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSheetData('Faculty');
        if (data && data.length > 0) {
          // Normalize sheet data
          const normalized = data.map(item => {
            const isAstha = item.Name?.toLowerCase().includes('astha');
            const isPandey = item.Name?.toLowerCase().includes('pandey') || item.Name?.toLowerCase().includes('vijyendra');
            const isJeyavel = item.Name?.toLowerCase().includes('jeyavel');

            let scholar = item.Scholar || '';
            let orcid = item.ORCID || '';
            let photoUrl = item['Photo URL'] || '';

            if (isAstha) {
              if (!photoUrl) {
                photoUrl = '/photos/astha.png';
              }
              if (!scholar || scholar === 'https://scholar.google.com') {
                scholar = 'https://scholar.google.com/citations?user=FSA3Mp0AAAAJ&hl=en';
              }
              if (!orcid || orcid === 'https://orcid.org') {
                orcid = 'https://orcid.org/0000-0002-1507-3777';
              }
            } else if (isPandey) {
              if (!photoUrl) {
                photoUrl = '/photos/pandey.png';
              }
              if (!scholar || scholar === 'https://scholar.google.com') {
                scholar = 'https://scholar.google.com/citations?user=Sla4s00AAAAJ&hl=en';
              }
              if (!orcid || orcid === 'https://orcid.org') {
                orcid = 'https://orcid.org/0000-0002-7155-5543';
              }
            } else if (isJeyavel) {
              if (!photoUrl) {
                photoUrl = '/photos/jeyavel.jpg';
              }
              if (!orcid || orcid === 'https://orcid.org') {
                orcid = 'https://orcid.org/0000-0002-7431-7268';
              }
            }

            return {
              Name: item.Name || '',
              Designation: item.Designation || 'Assistant Professor',
              Specialization: item.Specialization || '',
              Email: item.Email || '',
              'Photo URL': photoUrl,
              Bio: item.Bio || '',
              ORCID: orcid,
              Scholar: scholar,
              ResearchGate: item.ResearchGate || ''
            };
          });
          setFaculty(normalized);
        } else {
          setFaculty(fallbackFaculty as FacultyPerson[]);
        }
      } catch (err) {
        console.warn('Failed to load coordinator data, falling back:', err);
        setFaculty(fallbackFaculty as FacultyPerson[]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-blue-950">
            <div 
              onClick={() => {
                const next = romateClicks + 1;
                setRomateClicks(next);
                if (next >= 3) {
                  setShowRomateModal(true);
                  setRomateClicks(0);
                }
                setTimeout(() => setRomateClicks(0), 1200);
              }}
              onDoubleClick={() => setShowRomateModal(true)}
              className="p-2 rounded-xl bg-blue-50 border border-blue-100 cursor-pointer select-none"
              title="Faculty & Coordinators Directory"
            >
              <Award className="h-6 w-6 text-blue-950" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Faculty & Coordinators
            </h2>
          </div>
          <p className="text-sm text-slate-600 font-medium max-w-2xl pl-0.5">
            Principal investigators and academic leaders directing research initiatives in the Biofeedback & Cognitive Neuroscience Laboratory
            <span 
              onClick={() => setShowRomateModal(true)}
              className="cursor-default select-none text-slate-600 hover:text-blue-950 transition-colors"
              title="Department of Psychology, Central University of Karnataka"
            >
              .
            </span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 font-semibold text-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-950 mr-2" />
          Loading coordinator profiles...
        </div>
      ) : (
        <div className="space-y-8">
          {faculty.map((person, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Profile Photo & Primary Identity (4 cols) */}
              <div className="lg:col-span-4 flex flex-col items-center text-center lg:items-start lg:text-left space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
                <div className="relative">
                  {person['Photo URL'] && !imgErrors[person.Name] ? (
                    <img 
                      src={getDirectDriveUrl(person['Photo URL'])} 
                      alt={person.Name} 
                      className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
                      onError={() => {
                        setImgErrors(prev => ({ ...prev, [person.Name]: true }));
                      }}
                    />
                  ) : (
                    <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 border-2 border-slate-200 flex items-center justify-center text-blue-950 font-extrabold text-3xl shadow-2xs">
                      {getInitials(person.Name)}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 w-full">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {person.Name}
                  </h3>
                  <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-950 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    {person.Designation || 'Assistant Professor'}
                  </span>
                  <p className="text-xs font-semibold text-slate-500 pt-0.5">
                    Department of Psychology<br />Central University of Karnataka
                  </p>
                </div>

                {/* Academic Identifiers & Badges */}
                <div className="w-full pt-2 flex flex-col gap-2">
                  {/* Google Scholar Badge */}
                  {person.Scholar && (
                    <a
                      href={person.Scholar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-950 text-xs font-bold transition-all shadow-2xs group"
                    >
                      <span className="inline-flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-900 group-hover:scale-110 transition-transform" />
                        Google Scholar
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-950" />
                    </a>
                  )}

                  {/* ORCID Badge */}
                  {person.ORCID && (
                    <a
                      href={person.ORCID}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-950 text-xs font-bold transition-all shadow-2xs group"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#A6CE39] text-white flex items-center justify-center font-bold text-[9px] leading-none shrink-0 group-hover:scale-110 transition-transform">
                          iD
                        </span>
                        ORCID Profile
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-900" />
                    </a>
                  )}

                  {/* Email Button */}
                  {person.Email && (
                    <a
                      href={`mailto:${person.Email}`}
                      className="inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-950 text-xs font-bold transition-all shadow-2xs group"
                    >
                      <span className="inline-flex items-center gap-2 truncate">
                        <Mail className="h-4 w-4 text-blue-950 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="truncate">{person.Email}</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-950 shrink-0" />
                    </a>
                  )}
                </div>
              </div>

              {/* Professional Biography & Specialization (8 cols) */}
              <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Biography & Research Background
                  </h4>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-700 font-sans whitespace-pre-line font-normal">
                    {person.Bio || `${person.Name} is a distinguished faculty coordinator driving advanced cognitive and biofeedback analysis within the laboratory framework.`}
                  </p>
                </div>

                {person.Specialization && (
                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Research Specializations & Interests
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {person.Specialization.split(/[,&]/).map((interest, i) => (
                        <span 
                          key={i} 
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-blue-950" />
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Hidden Dedication & Special Acknowledgement Modal: Prof. Romate John */}
      {showRomateModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowRomateModal(false)}
        >
          <div 
            className="relative max-w-3xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-10 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Elegant Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setShowRomateModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Close Tribute"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Special Acknowledgement · Founding Leadership
              </span>
            </div>

            {/* Content Grid: Photo + Tribute */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* Photo Column (4 cols) */}
              <div className="md:col-span-4 flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md bg-slate-100">
                    <img 
                      src="/photos/romate_john.png" 
                      alt="Prof. Romate John" 
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.endsWith('/photos/romate_john.jpg')) {
                          target.src = '/photos/romate_john.jpg';
                        }
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 rounded-xl shadow-sm">
                    <Heart className="h-4 w-4 fill-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Prof. Romate John
                  </h3>
                  <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wider block">
                    Professor of Psychology
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block">
                    HOD for 13 Years (2012–2025)
                  </span>
                </div>

                <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                  Department of Psychology<br />Central University of Karnataka
                </p>

                {/* Google Scholar Link */}
                <a
                  href="https://scholar.google.com/citations?user=tpHvDVkAAAAJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-950 text-xs font-bold transition-all shadow-3xs w-full justify-center mt-2"
                >
                  <GraduationCap className="h-4 w-4 text-blue-900" />
                  <span>Google Scholar</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              </div>

              {/* Tribute & Story Column (8 cols) */}
              <div className="md:col-span-8 space-y-4 text-slate-700">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    The Founding Visionary Behind the Laboratory
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    A heartfelt tribute and recognition from the student scholars and engineers
                  </p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm leading-relaxed font-sans text-slate-600">
                  <p>
                    Special and eternal thanks to <strong className="text-slate-900 font-bold">Professor Romate John</strong>, without whom this laboratory could never have been possible. His relentless personal efforts, persistent resourcefulness, and academic vision were the true foundation that established this laboratory.
                  </p>
                  <p>
                    Serving with distinction as the <strong className="text-blue-950 font-bold">Head of the Department of Psychology for 13 years</strong> (2012–2025) at the Central University of Karnataka, Prof. Romate John laid the institutional and scientific groundwork upon which modern psychophysiological research at CUK thrives today.
                  </p>
                  <blockquote className="border-l-4 border-amber-400 pl-3.5 py-2 italic text-slate-700 bg-amber-50/50 rounded-r-xl font-medium text-xs">
                    "As student scholars and key developers of this platform, we cannot hide this fundamental truth: the existence of this laboratory was made possible through the enduring leadership, vision, and tireless support of Professor Romate John."
                  </blockquote>
                </div>

                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold text-slate-600">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                    🏛️ 13 Years HOD Tenure (2012–2025)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                    🧠 Founding Pioneer of the Lab
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                    🎓 Academic Mentor & Guide
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Footer bar */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Department of Psychology · Central University of Karnataka</span>
              <button
                onClick={() => setShowRomateModal(false)}
                className="text-xs font-bold text-blue-950 hover:underline"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
