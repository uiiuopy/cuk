import React, { useState, useEffect } from 'react';
import { Mail, BookOpen, Award, ExternalLink, GraduationCap } from 'lucide-react';
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSheetData('Faculty');
        if (data && data.length > 0) {
          // Normalize sheet data
          const normalized = data.map(item => {
            const isAstha = item.Name?.toLowerCase().includes('astha');
            const isPandey = item.Name?.toLowerCase().includes('pandey') || item.Name?.toLowerCase().includes('vijyendra');

            let scholar = item.Scholar || '';
            let orcid = item.ORCID || '';

            if (isAstha) {
              if (!scholar || scholar === 'https://scholar.google.com') {
                scholar = 'https://scholar.google.com/citations?user=FSA3Mp0AAAAJ&hl=en';
              }
              if (!orcid || orcid === 'https://orcid.org') {
                orcid = 'https://orcid.org/0000-0002-1507-3777';
              }
            } else if (isPandey) {
              if (!scholar || scholar === 'https://scholar.google.com') {
                scholar = 'https://scholar.google.com/citations?user=Sla4s00AAAAJ&hl=en';
              }
            }

            return {
              Name: item.Name || '',
              Designation: item.Designation || 'Assistant Professor',
              Specialization: item.Specialization || '',
              Email: item.Email || '',
              'Photo URL': item['Photo URL'] || '',
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
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
              <Award className="h-6 w-6 text-blue-950" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Faculty & Coordinators
            </h2>
          </div>
          <p className="text-sm text-slate-600 font-medium max-w-2xl pl-0.5">
            Principal investigators and academic leaders directing research initiatives in the Biofeedback & Cognitive Neuroscience Laboratory.
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
                  {person['Photo URL'] ? (
                    <img 
                      src={getDirectDriveUrl(person['Photo URL'])} 
                      alt={person.Name} 
                      className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
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
    </div>
  );
}
