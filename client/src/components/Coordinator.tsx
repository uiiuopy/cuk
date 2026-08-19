import React, { useState, useEffect } from 'react';
import { Mail, BookOpen, Award, FileText, CheckCircle, ExternalLink, Globe } from 'lucide-react';
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
          const normalized = data.map(item => ({
            Name: item.Name || '',
            Designation: item.Designation || 'Assistant Professor',
            Specialization: item.Specialization || '',
            Email: item.Email || '',
            'Photo URL': item['Photo URL'] || '',
            Bio: item.Bio || '',
            ORCID: item.ORCID || 'https://orcid.org',
            Scholar: item.Scholar || 'https://scholar.google.com',
            ResearchGate: item.ResearchGate || 'https://www.researchgate.net'
          }));
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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-10 bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
        <div className="flex items-center gap-3 text-blue-950 mb-2">
          <Award className="h-6 w-6 text-blue-950" />
          <h2 className="text-2xl font-extrabold tracking-tight">Faculty & Coordinators</h2>
        </div>
        <p className="text-sm text-slate-600">
          Principal investigators and mentors leading the psychophysiology research programs.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 font-semibold text-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-950 mr-2" />
          Loading coordinator profiles...
        </div>
      ) : (
        <div className="space-y-12">
          {faculty.map((person, idx) => (
            <div 
              key={idx} 
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Left Column: Profile photo placeholder and CV link (Asymmetric: 4 cols) */}
              <div className="lg:col-span-4 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-8">
                <div className="w-full flex flex-col items-center">
                  {person['Photo URL'] ? (
                    <img 
                      src={getDirectDriveUrl(person['Photo URL'])} 
                      alt={person.Name} 
                      className="w-48 h-48 rounded-xl object-cover border-2 border-slate-200 shadow-sm"
                      onError={(e) => {
                        // Fallback on load error
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-blue-50 to-slate-100 border border-slate-200 flex items-center justify-center text-blue-950 font-extrabold text-4xl shadow-2xs">
                      {getInitials(person.Name)}
                    </div>
                  )}
                  
                  <h3 className="mt-4 text-xl font-extrabold text-slate-900 text-center tracking-tight">
                    {person.Name}
                  </h3>
                  <p className="text-xs text-blue-950 font-semibold uppercase tracking-wider mt-1 text-center bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {person.Designation || 'Assistant Professor'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 text-center font-medium">
                    Central University of Karnataka
                  </p>
                </div>

                <div className="w-full mt-6">
                  <button 
                    disabled
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed hover:bg-slate-200 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    📄 CV — coming soon
                  </button>
                </div>
              </div>

              {/* Right Column: Professional Details (Asymmetric: 8 cols) */}
              <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
                
                {/* Designation, Bio */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Biography</h4>
                  <p className="text-sm leading-relaxed text-slate-700 font-sans whitespace-pre-line">
                    {person.Bio || `${person.Name} is a distinguished faculty coordinator driving advanced cognitive and biofeedback analysis within the laboratory framework.`}
                  </p>
                </div>

                {/* Research Interests */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Research Interests & Specialization</h4>
                  <div className="flex flex-wrap gap-2">
                    {person.Specialization.split('&').map((interest, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                        <BookOpen className="h-3.5 w-3.5 text-blue-950" />
                        {interest.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Links (Email, ORCID, Scholar, ResearchGate) */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Academic Directory Links</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {person.Email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4 text-blue-950 shrink-0" />
                        <span className="font-semibold text-slate-900 shrink-0">Email:</span>
                        <a href={`mailto:${person.Email}`} className="hover:text-blue-950 hover:underline truncate">
                          {person.Email}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-600">
                      <Award className="h-4 w-4 text-blue-950 shrink-0" />
                      <span className="font-semibold text-slate-900 shrink-0">ORCID:</span>
                      <a 
                        href={person.ORCID || 'https://orcid.org'} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-blue-950 hover:underline flex items-center gap-1 truncate"
                      >
                        {person.ORCID ? 'orcid.org' : 'Link'} <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Globe className="h-4 w-4 text-blue-950 shrink-0" />
                      <span className="font-semibold text-slate-900 shrink-0">Google Scholar:</span>
                      <a 
                        href={person.Scholar || 'https://scholar.google.com'} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-blue-950 hover:underline flex items-center gap-1 truncate"
                      >
                        Scholar Profile <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <CheckCircle className="h-4 w-4 text-blue-950 shrink-0" />
                      <span className="font-semibold text-slate-900 shrink-0">ResearchGate:</span>
                      <a 
                        href={person.ResearchGate || 'https://www.researchgate.net'} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-blue-950 hover:underline flex items-center gap-1 truncate"
                      >
                        ResearchGate Profile <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
